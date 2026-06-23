import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  paperPlaneOutline, 
  alertCircleOutline, 
  cloudUploadOutline,
  playCircle,
  trashOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  timeOutline
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

  constructor(private toastCtrl: ToastController) {
    addIcons({ 
      paperPlaneOutline, 
      alertCircleOutline, 
      cloudUploadOutline,
      playCircle,
      trashOutline,
      addCircleOutline,
      checkmarkCircleOutline,
      timeOutline
    });
  }

  ngOnInit() {
    this.inyectarEstructuraBasePrueba();
    this.sincronizarBaseDatosLocal();

    // 🔄 REFRESCAMIENTO DINÁMICO COMPLETADO
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
    
    // 1. Usuarios registrados
    const dbGlobalUsuarios = localStorage.getItem('usuarios') || localStorage.getItem('db_usuarios_global');
    let usuariosGlobales: any[] = dbGlobalUsuarios ? JSON.parse(dbGlobalUsuarios) : [];

    // 2. Seguimiento de cursos
    const dbPersonalCursos = localStorage.getItem('db_cursos_personal');
    let datosTemporales: any[] = dbPersonalCursos ? JSON.parse(dbPersonalCursos) : [];

    // 3. Puente de Sincronización Inversa
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

    // 4. Historial de Cursos (PDFs y Videos)
    const dbCursosCargados = localStorage.getItem('db_cursos_cargados_supervisor');
    this.listaCursos = dbCursosCargados ? JSON.parse(dbCursosCargados) : [];

    this.calcularMetricasDashboard();
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

  // ==========================================
  // ACCIONES: ALERTS / NOTIFICACIONES
  // ==========================================
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

  // ==========================================
  // ACCIONES: MANEJO DE CURSOS Y NUEVOS VIDEOS
  // ==========================================
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

    const coursesBase = [
      { titulo: 'Uso correcto de equipos de protección', tag: 'EPP', tipo: 'PDF', progresoCalculado: progresoActualSesion, imagen: 'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?auto=format&fit=crop&w=600&q=80', blobData: null },
      { titulo: 'Prevención de incendios en almacén', tag: 'Riesgos', tipo: 'PDF', progresoCalculado: progresoActualSesion, imagen: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80', blobData: null }
    ];

    const cursosSubidos = this.listaCursos.map((c: any) => {
      const idCursoNormalizado = 'progreso_curso_' + c.titulo.replace(/\s+/g, '_');
      const progresoEspecifico = localStorage.getItem(idCursoNormalizado);

      return {
        id: c.fechaRegistro + '_' + c.titulo,
        titulo: c.titulo,
        tag: c.tipo === 'VIDEO' ? 'Multimedia' : 'Nuevo Ingreso',
        tipo: c.tipo || 'PDF', 
        progresoCalculado: progresoEspecifico ? parseInt(progresoEspecifico, 10) : progresoActualSesion, 
        imagen: c.tipo === 'VIDEO' 
          ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80' 
          : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        blobData: c.contenidoArchivo || null
      };
    });

    const totalCursos = [...coursesBase, ...cursosSubidos];
    if (!this.busquedaOperario.trim()) return totalCursos;
    return totalCursos.filter((c: any) => c.titulo.toLowerCase().includes(this.busquedaOperario.toLowerCase()));
  }

  async procesarArchivoCargado(event: any) {
    const archivoSeleccionado = event.target.files[0];
    if (archivoSeleccionado) {
      const nombreArchivo = archivoSeleccionado.name;
      
      let tipoArchivo = 'PDF';
      if (archivoSeleccionado.type.includes('video') || nombreArchivo.toLowerCase().endsWith('.mp4') || nombreArchivo.toLowerCase().endsWith('.mov')) {
        tipoArchivo = 'VIDEO';
      }

      const hoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

      if (archivoSeleccionado.size > 15 * 1024 * 1024) {
        alert('El archivo supera los 15MB permitidos para capacitaciones.');
        event.target.value = '';
        return;
      }

      const lector = new FileReader();
      lector.onload = async (e: any) => {
        const nuevaCapacitacion = {
          titulo: nombreArchivo,
          tipo: tipoArchivo, 
          fechaRegistro: hoy,
          contenidoArchivo: e.target.result 
        };

        this.listaCursos.unshift(nuevaCapacitacion);
        localStorage.setItem('db_cursos_cargados_supervisor', JSON.stringify(this.listaCursos));

        this.listaPersonal.forEach((u: any) => u.progreso = 0);
        localStorage.setItem('db_cursos_personal', JSON.stringify(this.listaPersonal));

        const idCursoNormalizado = 'progreso_curso_' + nombreArchivo.replace(/\s+/g, '_');
        localStorage.setItem(idCursoNormalizado, '0');

        const toast = await this.toastCtrl.create({
          message: `¡${tipoArchivo} "${nombreArchivo}" subido con éxito al sistema!`,
          duration: 3000,
          color: 'success',
          position: 'middle'
        });
        await toast.present();
        this.sincronizarBaseDatosLocal();
      };
      lector.readAsDataURL(archivoSeleccionado);
      event.target.value = '';
    }
  }

  verContenidoCurso(curso: any) {
    const origenDatos = curso.blobData || curso.contenidoArchivo || 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaY9kZWZhdWx0Xw==';
    const idCursoNormalizado = 'progreso_curso_' + curso.titulo.replace(/\s+/g, '_');
    
    if (origenDatos) {
      const nuevaVentana = window.open();
      if (nuevaVentana) {
        nuevaVentana.document.title = `Visualizando: ${curso.titulo}`;
        
        const nombreSesion = localStorage.getItem('nombreSesion') || '';
        let progresoInicial = parseInt(localStorage.getItem(idCursoNormalizado) || '0', 10);

        const esVideo = curso.tipo === 'VIDEO';
        const renderEstructura = esVideo 
          ? `<video id="reproductor" src="${origenDatos}" controls autoplay style="max-width:100%; max-height:85vh; margin:auto; display:block; border-radius:8px;"></video>` 
          : `<canvas id="pdf-canvas" style="box-shadow: 0 10px 25px rgba(0,0,0,0.3); background: white; max-width: 100%; margin: 0 auto; display: block;"></canvas>`;

        nuevaVentana.document.write(`
          <html style="margin:0;padding:0;width:100%;height:100%;background:#1e293b;font-family:sans-serif;user-select:none;">
            <head>
              <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
            </head>
            <body style="margin:0;padding:0;height:100%;display:flex;flex-direction:column;overflow:hidden;">
              <div style="background: #0f172a; color: #fff; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 14px;">
                <span style="font-weight: 600;">📖 ${curso.titulo}</span>
                <div id="controles-pdf" style="display: ${esVideo ? 'none' : 'flex'}; align-items: center; gap: 10px;">
                  <button id="btn-ant" style="background:#334155; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">◀ Ant</button>
                  <span>Pág. <span id="num-pag" style="color:#38bdf8; font-weight:bold;">1</span> de <span id="total-pags">?</span></span>
                  <button id="btn-sig" style="background:#334155; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Sig ▶</button>
                </div>
                <div>
                  <span style="font-size: 12px; color: #94a3b8;">Progreso:</span>
                  <span id="txt-progreso" style="background: #2563eb; padding: 4px 10px; border-radius: 6px; font-weight: bold;">${progresoInicial}%</span>
                </div>
              </div>
              <div style="flex: 1; overflow: auto; display: flex; justify-content: center; align-items: flex-start; padding: 20px; background: #334155;">
                ${renderEstructura}
              </div>
              <script>
                const idCurso = "${idCursoNormalizado}";
                const nombreS = "${nombreSesion}";
                
                if (!${esVideo}) {
                  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                  let pdfDoc = null, pageNum = 1, maxPag = 1;
                  const canvas = document.getElementById('pdf-canvas');
                  const ctx = canvas.getContext('2d');

                  pdfjsLib.getDocument("${origenDatos}").promise.then(pdf => {
                    pdfDoc = pdf;
                    document.getElementById('total-pags').innerText = pdf.numPages;
                    renderPage(pageNum);
                  }).catch(() => { document.getElementById('total-pags').innerText = "1"; });

                  function renderPage(num) {
                    pdfDoc.getPage(num).then(page => {
                      const viewport = page.getViewport({ scale: 1.3 });
                      canvas.height = viewport.height; canvas.width = viewport.width;
                      page.render({ canvasContext: ctx, viewport: viewport });
                    });
                    document.getElementById('num-pag').innerText = num;
                  }

                  function salvar(p) {
                    localStorage.setItem(idCurso, p.toString());
                    try {
                      let db = JSON.parse(localStorage.getItem('db_cursos_personal') || '[]');
                      let u = db.find(x => x.nombre.toLowerCase() === nombreS.toLowerCase());
                      if(u) { u.progreso = p; localStorage.setItem('db_cursos_personal', JSON.stringify(db)); }
                    }catch(e){}
                  }

                  document.getElementById('btn-sig').addEventListener('click', () => {
                    if (pageNum >= pdfDoc.numPages) return;
                    pageNum++; if(pageNum > maxPag) { maxPag = pageNum; }
                    let pct = Math.round((maxPag / pdfDoc.numPages) * 100);
                    document.getElementById('txt-progreso').innerText = pct + "%";
                    salvar(pct); renderPage(pageNum);
                  });
                  document.getElementById('btn-ant').addEventListener('click', () => { if (pageNum <= 1) return; pageNum--; renderPage(pageNum); });
                } else {
                  const vid = document.getElementById('reproductor');
                  vid.addEventListener('timeupdate', () => {
                    let pct = Math.round((vid.currentTime / vid.duration) * 100) || 0;
                    document.getElementById('txt-progreso').innerText = pct + "%";
                    localStorage.setItem(idCurso, pct.toString());
                    try {
                      let db = JSON.parse(localStorage.getItem('db_cursos_personal') || '[]');
                      let u = db.find(x => x.nombre.toLowerCase() === nombreS.toLowerCase());
                      if(u && pct > u.progreso) { u.progreso = pct; localStorage.setItem('db_cursos_personal', JSON.stringify(db)); }
                    }catch(e){}
                  });
                }
              </script>
            </body>
          </html>
        `);
        nuevaVentana.document.close();

        const monitorCierre = setInterval(() => {
          if (nuevaVentana.closed) {
            clearInterval(monitorCierre);
            this.sincronizarBaseDatosLocal(); 
          }
        }, 800);
      }
    }
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