import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { 
  paperPlaneOutline, 
  alertCircleOutline, 
  cloudUploadOutline,
  playCircle,
  trashOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  arrowBackOutline,
  bookOutline,
  documentTextOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab2Page implements OnInit, OnDestroy {

  rolUsuario: string = 'Supervisor'; 
  busquedaOperario: string = '';
  intervaloMemoria: any;

  // Colecciones locales del módulo de capacitación
  listaPersonal: any[] = [];
  listaCursos: any[] = [];

  // Métricas KPI dinámicas
  totalCapacitados: number = 0;
  totalEnProceso: number = 0;
  totalAtrasados: number = 0;

  // Variables específicas Entorno Cisco Netacad para Trabajador
  cursoSeleccionado: any = null;
  vistaActual: 'pdf' | 'quiz' = 'pdf';
  urlPdfSegura!: SafeResourceUrl;
  progresoCursoActivo: number = 0;
  respuestasTrabajador: { [key: number]: string } = {};
  cuestionarioActivo: any[] = [];

  // Base de datos estática de preguntas por módulo
  bancoPreguntas: { [key: string]: any[] } = {
    'epp.pdf': [
      { pregunta: '¿Cuál es la función principal del casco Clase E?', opciones: ['Protección de caídas de objetos e impactos eléctricos de alta tensión', 'Protección únicamente de salpicaduras químicas', 'Uso estético industrial'], correcta: 'Protección de caídas de objetos e impactos eléctricos de alta tensión' },
      { pregunta: '¿Cada cuánto tiempo deben inspeccionarse los arneses de seguridad anticaídas?', opciones: ['Anualmente', 'Antes de cada uso diario', 'Sólo después de sufrir un accidente'], correcta: 'Antes de cada uso diario' }
    ],
    'incendios.pdf': [
      { pregunta: '¿Qué tipo de extintor es el adecuado para fuegos Clase C (Equipos Eléctricos Energizados)?', opciones: ['Extintor de Agua Presurizada', 'Extintor de Dióxido de Carbono (CO2) o PQS', 'Manta húmeda común'], correcta: 'Extintor de Dióxido de Carbono (CO2) o PQS' },
      { pregunta: '¿Cuál es el primer paso en el protocolo PAS ante una emergencia de incendio?', opciones: ['Correr hacia la salida sin avisar', 'Proteger (Asegurar la zona para ti y la víctima)', 'Llamar directamente a los familiares'], correcta: 'Proteger (Asegurar la zona para ti y la víctima)' }
    ]
  };

  constructor(private toastCtrl: ToastController, private sanitizer: DomSanitizer) {
    addIcons({ 
      paperPlaneOutline, 
      alertCircleOutline, 
      cloudUploadOutline,
      playCircle,
      trashOutline,
      addCircleOutline,
      checkmarkCircleOutline,
      timeOutline,
      arrowBackOutline,
      bookOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    this.inyectarEstructuraBasePrueba();
    this.sincronizarBaseDatosLocal();

    this.intervaloMemoria = setInterval(() => {
      this.sincronizarBaseDatosLocal();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervaloMemoria) {
      clearInterval(this.intervaloMemoria);
    }
  }

  ionViewWillEnter() {
    this.sincronizarBaseDatosLocal();
  }

  sincronizarBaseDatosLocal() {
    this.obtenerRolSesion();
    
    const dbGlobalUsuarios = localStorage.getItem('usuarios') || localStorage.getItem('db_usuarios_global');
    let usuariosGlobales: any[] = dbGlobalUsuarios ? JSON.parse(dbGlobalUsuarios) : [];

    const dbPersonalCursos = localStorage.getItem('db_cursos_personal');
    let datosTemporales: any[] = dbPersonalCursos ? JSON.parse(dbPersonalCursos) : [];

    let huboCambios = false;
    const operariosRegistrados = usuariosGlobales.filter((u: any) => 
      u.rol?.toLowerCase() === 'trabajador' || u.rol?.toLowerCase() === 'operario' || !u.rol
    );

    operariosRegistrados.forEach((usuarioGlobal: any) => {
      const existeEnCursos = datosTemporales.some((p: any) => 
        p.nombre.toLowerCase() === (usuarioGlobal.nombre || usuarioGlobal.username || '').toLowerCase()
      );

      if (!existeEnCursos && (usuarioGlobal.nombre || usuarioGlobal.username)) {
        datosTemporales.push({
          nombre: usuarioGlobal.nombre || usuarioGlobal.username,
          cargo: usuarioGlobal.cargo || 'Operario de Planta',
          progreso: usuarioGlobal.progreso !== undefined ? usuarioGlobal.progreso : 0
        });
        huboCambios = true;
      }
    });

    this.listaPersonal = [...datosTemporales];
    if (huboCambios) {
      localStorage.setItem('db_cursos_personal', JSON.stringify(this.listaPersonal));
    }

    const dbCursosCargados = localStorage.getItem('db_cursos_cargados_supervisor');
    this.listaCursos = dbCursosCargados ? JSON.parse(dbCursosCargados) : [];

    this.calcularMetricasDashboard();

    // Actualizar progreso en vivo si se encuentra en la vista Netacad
    if (this.cursoSeleccionado) {
      const idCursoNormalizado = 'progreso_curso_' + this.cursoSeleccionado.titulo.replace(/\s+/g, '_');
      const progresoActual = localStorage.getItem(idCursoNormalizado);
      this.progresoCursoActivo = progresoActual ? parseInt(progresoActual, 10) : 0;
    }
  }

  obtenerRolSesion() {
    const rolGuardado = localStorage.getItem('rolActivo') || localStorage.getItem('rol');
    if (rolGuardado) {
      this.rolUsuario = rolGuardado.charAt(0).toUpperCase() + rolGuardado.slice(1).toLowerCase();
    }
  }

  calcularMetricasDashboard() {
    this.totalCapacitados = this.listaPersonal.filter((e: any) => e.progreso === 100).length;
    this.totalEnProceso = this.listaPersonal.filter((e: any) => e.progreso >= 30 && e.progreso < 100).length;
    this.totalAtrasados = this.listaPersonal.filter((e: any) => e.progreso < 30).length;
  }

  async notificarCritico(nombre: string) {
    const toast = await this.toastCtrl.create({
      message: `⚠️ Alerta Crítica enviada a ${nombre}. Avance inferior al 30%.`,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

  async enviarRecordatorio(nombre: string) {
    const toast = await this.toastCtrl.create({
      message: `🔔 Recordatorio de capacitación enviado a ${nombre}.`,
      duration: 2500,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
  }

  async inscribirCurso(nombreCurso: string) {
    const toast = await this.toastCtrl.create({
      message: `✅ Te has inscrito correctamente en: ${nombreCurso}`,
      duration: 3000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  get personalFiltrado() {
    if (!this.busquedaOperario.trim()) return this.listaPersonal;
    return this.listaPersonal.filter((e: any) => 
      e.nombre.toLowerCase().includes(this.busquedaOperario.toLowerCase())
    );
  }

  get coursesTrabajadorFiltrados() {
    const nombreSesion = (localStorage.getItem('nombreSesion') || '').trim().toLowerCase();
    
    let progresoActualSesion = 0;
    const usuarioEncontrado = this.listaPersonal.find((u: any) => u.nombre.toLowerCase().trim() === nombreSesion);
    if (usuarioEncontrado) {
      progresoActualSesion = usuarioEncontrado.progreso;
    }

    // Vinculamos archivos locales fijos solicitados en assets
    const coursesBase = [
      { titulo: 'Uso correcto de equipos de protección', tag: 'EPP', tipo: 'PDF', archivoLocal: 'epp.pdf', progresoCalculatedKey: 'progreso_curso_Uso_correcto_de_equipos_de_protección', imagen: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?auto=format&fit=crop&w=600&q=80', blobData: null },
      { titulo: 'Prevención de incendios en almacén', tag: 'Riesgos', tipo: 'PDF', archivoLocal: 'incendios.pdf', progresoCalculatedKey: 'progreso_curso_Prevención_de_incendios_en_almacén', imagen: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80', blobData: null }
    ];

    const totalCursos = coursesBase.map(c => {
      const progresoEspecifico = localStorage.getItem(c.progresoCalculatedKey);
      return {
        ...c,
        progresoCalculado: progresoEspecifico ? parseInt(progresoEspecifico, 10) : progresoActualSesion
      };
    });

    if (!this.busquedaOperario.trim()) return totalCursos;
    return totalCursos.filter((c: any) => c.titulo.toLowerCase().includes(this.busquedaOperario.toLowerCase()));
  }

  // ==========================================
  // NUEVAS CAPACIDADES: WORKSPACE CISCO NETACAD
  // ==========================================
  seleccionarCursoNetacad(curso: any) {
    this.cursoSeleccionado = curso;
    this.vistaActual = 'pdf';
    this.respuestasTrabajador = {};

    // Construcción de la ruta local de assets sanitizada
    const rutaRelativa = `assets/pdf/${curso.archivoLocal}`;
    this.urlPdfSegura = this.sanitizer.bypassSecurityTrustResourceUrl(rutaRelativa);

    // Cargar preguntas asociadas por archivo
    this.cuestionarioActivo = this.bancoPreguntas[curso.archivoLocal] || [];

    const idCursoNormalizado = 'progreso_curso_' + curso.titulo.replace(/\s+/g, '_');
    const progresoActual = localStorage.getItem(idCursoNormalizado);
    this.progresoCursoActivo = progresoActual ? parseInt(progresoActual, 10) : 0;

    // Al abrir el material de estudio otorgamos un progreso inicial automático del 50%
    if (this.progresoCursoActivo < 50) {
      this.actualizarProgresoGlobalTrabajador(50);
    }
  }

  cambiarVistaNetacad(vista: 'pdf' | 'quiz') {
    this.vistaActual = vista;
  }

  cerrarWorkspaceNetacad() {
    this.cursoSeleccionado = null;
    this.sincronizarBaseDatosLocal();
  }

  async evaluarCuestionarioTrabajador() {
    if (Object.keys(this.respuestasTrabajador).length < this.cuestionarioActivo.length) {
      alert('Por favor responde todas las preguntas expuestas en el cuestionario antes de enviar.');
      return;
    }

    let aprobadas = 0;
    this.cuestionarioActivo.forEach((q, idx) => {
      if (this.respuestasTrabajador[idx] === q.correcta) {
        aprobadas++;
      }
    });

    if (aprobadas === this.cuestionarioActivo.length) {
      this.actualizarProgresoGlobalTrabajador(100);
      const toast = await this.toastCtrl.create({
        message: '🎉 ¡Evaluación Excelente! Has contestado correctamente todas las preguntas. Módulo completado al 100%.',
        duration: 3500,
        color: 'success',
        position: 'middle'
      });
      await toast.present();
    } else {
      alert(`Has acertado ${aprobadas} de ${this.cuestionarioActivo.length}. Revisa el manual PDF e inténtalo de nuevo para completarlo.`);
    }
  }

  actualizarProgresoGlobalTrabajador(nuevoProgreso: number) {
    if (!this.cursoSeleccionado) return;

    const idCursoNormalizado = 'progreso_curso_' + this.cursoSeleccionado.titulo.replace(/\s+/g, '_');
    localStorage.setItem(idCursoNormalizado, nuevoProgreso.toString());
    this.progresoCursoActivo = nuevoProgreso;

    const nombreSesion = (localStorage.getItem('nombreSesion') || '').trim().toLowerCase();
    if (nombreSesion) {
      try {
        let db = JSON.parse(localStorage.getItem('db_cursos_personal') || '[]');
        let operario = db.find((x: any) => x.nombre.toLowerCase().trim() === nombreSesion);
        if (operario) {
          operario.progreso = nuevoProgreso;
          localStorage.setItem('db_cursos_personal', JSON.stringify(db));
        }
      } catch (e) {
        console.error('Error al actualizar base local de progresos', e);
      }
    }
  }

  // Métodos heredados del Supervisor para manejo complementario
  async procesarArchivoCargado(event: any) {
    const archivoSeleccionado = event.target.files[0];
    if (archivoSeleccionado) {
      const nombreArchivo = archivoSeleccionado.name;
      let tipoArchivo = 'PDF';
      if (archivoSeleccionado.type.includes('video') || nombreArchivo.toLowerCase().endsWith('.mp4')) {
        tipoArchivo = 'VIDEO';
      }
      const hoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

      if (archivoSeleccionado.size > 15 * 1024 * 1024) {
        alert('El archivo supera los 15MB permitidos.');
        return;
      }

      const lector = new FileReader();
      lector.onload = async (e: any) => {
        const nuevaCapacitacion = { titulo: nombreArchivo, tipo: tipoArchivo, fechaRegistro: hoy, contenidoArchivo: e.target.result };
        this.listaCursos.unshift(nuevaCapacitacion);
        localStorage.setItem('db_cursos_cargados_supervisor', JSON.stringify(this.listaCursos));
        this.sincronizarBaseDatosLocal();
      };
      lector.readAsDataURL(archivoSeleccionado);
    }
  }

  verContenidoCurso(curso: any) {
    // Método alternativo para Supervisor abriendo pestañas externas individuales
  }

  async eliminarCursoCargado(cursoParaEliminar: any, event: Event) {
    event.stopPropagation();
    if (confirm(`¿Deseas eliminar el módulo "${cursoParaEliminar.titulo}"?`)) {
      this.listaCursos = this.listaCursos.filter((c: any) => c.titulo !== cursoParaEliminar.titulo);
      localStorage.setItem('db_cursos_cargados_supervisor', JSON.stringify(this.listaCursos));
      this.sincronizarBaseDatosLocal();
    }
  }

  inyectarEstructuraBasePrueba() {
    const check = localStorage.getItem('db_cursos_personal');
    if (!check) {
      const inicial = [
        { nombre: 'Juan Pérez Martínez', cargo: 'Operario de Almacén', progreso: 0 },
        { nombre: 'Crhistian Cordova', cargo: 'Asistente de Logística', progreso: 0 }
      ];
      localStorage.setItem('db_cursos_personal', JSON.stringify(inicial));
    }
  }
}