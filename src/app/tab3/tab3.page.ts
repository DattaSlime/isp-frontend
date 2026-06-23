import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  cloudUploadOutline, 
  checkmarkCircle, 
  closeCircle, 
  warningOutline, 
  eyeOutline,
  arrowBackOutline, 
  bookOutline, 
  caretBackOutline, 
  caretForwardOutline, 
  listOutline, 
  documentTextOutline, 
  ellipseOutline, 
  chevronForwardOutline,
  shieldCheckmarkOutline,
  documentText,
  schoolOutline,
  carOutline,
  speedometerOutline,
  constructOutline,
  flashOutline,
  trashOutline,
  alertCircleOutline,
  timeOutline,
  personOutline
} from 'ionicons/icons';

// Estructuras extendidas para dar soporte técnico al motor de evaluación
interface PreguntaExamen {
  enunciado: string;
  opciones: string[];
  respuestaCorrectaIdx: number;
  respuestaUsuarioIdx?: number | null;
}

interface Subtema {
  id: string;
  titulo: string;
  completado: boolean;
  progresoLectura: string;
  esExamen?: boolean;
  contenidoHtml?: string; 
  // Propiedades añadidas para la gestión de exámenes
  preguntas?: PreguntaExamen[];
  examenRendido?: boolean;
  notaFinal?: number;
}

interface Modulo {
  id: number;
  titulo: string;
  progreso: number;
  abierto: boolean;
  subtemas: Subtema[];
}

interface Curso {
  id: string;
  nombre: string;
  modulos: Modulo[];
}

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab3Page implements OnInit, OnDestroy {

  modoCursoActivo: boolean = false;
  cursoSeleccionadoId: string = 'epp'; 
  nombreCurso: string = "Uso correcto de equipos de protección";
  progresoGlobal: number = 0;
  
  subtemaSeleccionado: any = null;
  modulos: Modulo[] = [];

  bancoCursos: { [key: string]: Curso } = {
    'epp': {
      id: 'epp',
      nombre: 'Uso correcto de equipos de protección',
      modulos: [
        {
          id: 1,
          titulo: "Módulo 1: Fundamentos de EPP y Marco Legal (Ley N° 29783)",
          progreso: 0,
          abierto: true,
          subtemas: [
            { 
              id: "1.0", 
              titulo: "1.0. Introducción a la Seguridad y Salud en el Trabajo", 
              completado: false, 
              progresoLectura: "0/5",
              contenidoHtml: `
                <h3>1.0. Introducción a la SST en ISP PERÚ</h3>
                <p>La Seguridad y Salud en el Trabajo (SST) es un derecho fundamental de todos los colaboradores de nuestra organización. Su objetivo primordial es promover una cultura de prevención de riesgos laborales mediante la identificación de peligros y la evaluación de control de riesgos (IPERC).</p>
                <div class="info-note">
                  <b>Dato Clave:</b> En ISP PERÚ, la meta anual siempre es "Cero Accidentes". Cada minuto invertido en revisar tu entorno salva vidas.
                </div>
                <h4>Principios Fundamentales de la Prevención</h4>
                <ul>
                  <li><b>Compromiso:</b> Gestión integrada de la seguridad en todos los niveles operativos.</li>
                  <li><b>Mitigación:</b> Eliminación de fuentes de peligro antes de iniciar la jornada.</li>
                  <li><b>Responsabilidad:</b> Uso obligatorio y fiscalizado de las barreras de protección.</li>
                </ul>
              `
            },
            { 
              id: "1.1", 
              titulo: "1.1. Obligaciones Legales del Trabajador y la Empresa", 
              completado: false, 
              progresoLectura: "0/7",
              contenidoHtml: `
                <h3>1.1. Obligaciones Legales según el Marco Jurídico</h3>
                <p>Bajo el amparo de la legislación de seguridad, tanto el empleador como el personal operativo tienen responsabilidades mandatorias que no se pueden delegar.</p>
                <h4>Responsabilidades del Empleador (ISP PERÚ):</h4>
                <p>Garantizar ambientes de trabajo seguros, entregar Equipos de Protección Individual (EPI/EPP) certificados sin costo alguno para el operario y realizar un mínimo de 4 capacitaciones anuales en SST.</p>
                <h4>Responsabilidades del Trabajador:</h4>
                <p>Utilizar de forma correcta y obligatoria los implementos de protección entregados, participar activamente en simulacros e informar de inmediato cualquier condición subestándar en el almacén o planta.</p>
              `
            },
            { 
              id: "1.2", 
              titulo: "1.2. Jerarquía de Controles de Riesgo en ISP PERÚ", 
              completado: false, 
              progresoLectura: "0/4",
              contenidoHtml: `
                <h3>1.2. Jerarquía de Controles (Método IPERC)</h3>
                <p>Cuando detectamos un peligro en la planta o almacén central, aplicamos la pirámide de control estructural de riesgos antes de ejecutar labores:</p>
                <ol>
                  <li><b>Eliminación:</b> Suprimir físicamente el peligro (ej. remover cables expuestos).</li>
                  <li><b>Sustitución:</b> Reemplazar el peligro por algo más seguro (ej. cambiar químicos nocivos).</li>
                  <li><b>Ingeniería:</b> Aislar a las personas del peligro (ej. colocar guardas en fajas).</li>
                  <li><b>Administrativos:</b> Cambiar la forma en que trabaja la gente (ej. señaléticas, rotación).</li>
                  <li><b>EPP:</b> Proteger al trabajador con elementos individuales. ¡Es la última línea de defensa!</li>
                </ol>
              `
            },
            { 
              id: "1.3", 
              titulo: "1.3. Certificaciones de Calidad ANSI y NTP en Equipos", 
              completado: false, 
              progresoLectura: "0/6",
              contenidoHtml: `
                <h3>1.3. Estándares Técnicos y Certificaciones</h3>
                <p>No cualquier plástico sirve como EPP. En ISP PERÚ exigimos que todos los lotes de protección pasen por rigurosas pruebas de laboratorios internacionales:</p>
                <ul>
                  <li><b>Normas ANSI (EE.UU):</b> Regulan la resistencia a impactos mecánicos en cascos (ANSI Z89.1) y anteojos de seguridad (ANSI Z87.1).</li>
                  <li><b>Normas NTP (Peruanas):</b> Aseguran la adaptación de los calzados e indumentarias a la antropometría y condiciones climáticas del sector industrial nacional.</li>
                </ul>
                <p><b>Nota Técnica:</b> El uso de réplicas o EPP alterados anula el seguro SCTR ante accidentes.</p>
              `
            },
            { 
              id: "1.4", 
              titulo: "1.4. Módulo de Práctica y Cuestionario Legal", 
              completado: false, 
              progresoLectura: "Examen", 
              esExamen: true,
              examenRendido: false,
              notaFinal: 0,
              preguntas: [
                {
                  enunciado: "¿Cuál es la última línea de defensa en la jerarquía de controles de riesgo según la Ley N° 29783?",
                  opciones: ["Controles de Ingeniería", "Eliminación del Peligro", "Equipos de Protección Personal (EPP)", "Controles Administrativos"],
                  respuestaCorrectaIdx: 2,
                  respuestaUsuarioIdx: null
                },
                {
                  enunciado: "¿Cuántas capacitaciones en SST como mínimo al año debe garantizar la empresa de forma obligatoria?",
                  opciones: ["2 capacitaciones", "4 capacitaciones", "1 capacitación", "6 capacitaciones"],
                  respuestaCorrectaIdx: 1,
                  respuestaUsuarioIdx: null
                },
                {
                  enunciado: "Si un casco cuenta con la certificación ANSI Z89.1, significa que ha sido testeado principalmente para resistir:",
                  opciones: ["Impactos mecánicos estructurales", "Altas temperaturas y fuego directo", "Salpicaduras de ácidos corrosivos", "Radiación ultravioleta"],
                  respuestaCorrectaIdx: 0,
                  respuestaUsuarioIdx: null
                }
              ]
            }
          ]
        },
        {
          id: 2,
          titulo: "Módulo 2: Protección Sensorial (Craneal, Ocular y Auditiva)",
          progreso: 0,
          abierto: false,
          subtemas: [
            { 
              id: "2.0", 
              titulo: "2.0. Cascos de Seguridad Industrial: Tipos y Clasificación", 
              completado: false, 
              progresoLectura: "0/5",
              contenidoHtml: `
                <h3>2.0. Cascos de Seguridad: Protección Craneal</h3>
                <p>El casco protege la caja craneana contra objetos en caída libre, descargas eléctricas y golpes laterales.</p>
                <h4>Clasificación por Impacto:</h4>
                <p><b>Tipo I:</b> Diseñados para mitigar impactos que provienen estrictamente de la zona superior.</p>
                <p><b>Tipo II:</b> Diseñados para impactos tanto verticales como horizontales (golpes laterales).</p>
                <h4>Clasificación Eléctrica:</h4>
                <p><b>Clase E (Dieléctricos):</b> Soportan hasta 20,000 voltios. Son obligatorios para técnicos de campo en redes.</p>
              `
            },
            { 
              id: "2.1", 
              titulo: "2.1. Protección Ocular contra Impactos y Salpicaduras", 
              completado: false, 
              progresoLectura: "0/8",
              contenidoHtml: `
                <h3>2.1. Protección Ocular y Facial</h3>
                <p>Los ojos son de las zonas más vulnerables en el Almacén y en zonas de despacho. Las lunas deben contar con filtros UV y policarbonato endurecido.</p>
                <ul>
                  <li><b>Gafas con protección lateral:</b> Ideales para virutas y polvo suspendido.</li>
                  <li><b>Goggles (Antiparras):</b> Sellado hermético. Obligatorios al manipular fluidos, baterías o químicos de limpieza industrial.</li>
                </ul>
              `
            }
          ]
        }
      ]
    },
    'incendios': {
      id: 'incendios',
      nombre: 'Prevención de incendios en almacén',
      modulos: [
        {
          id: 1,
          titulo: "Módulo 1: Química del Fuego y Naturaleza del Riesgo",
          progreso: 0,
          abierto: true,
          subtemas: [
            { 
              id: "1.0", 
              titulo: "1.0. El Triángulo y Tetraedro del Fuego", 
              completado: false, 
              progresoLectura: "0/4",
              contenidoHtml: `
                <h3>1.0. El Triángulo y Tetraedro del Fuego</h3>
                <p>Para que ocurra una combustión en nuestro almacén se necesitan tres elementos simultáneos: Combustible (material que se quema), Comburente (Oxígeno en el aire) y Energía de Activación (Calor). Al agregarse la reacción en cadena, conformamos el <b>Tetraedro del Fuego</b>.</p>
                <div class="info-note">
                  <b>Regla de Almacén:</b> Al romper o aislar cualquiera de estas cuatro caras del tetraedro, el incendio se extingue inmediatamente.
                </div>
              `
            },
            { 
              id: "1.1", 
              titulo: "1.1. Clasificación de Fuegos en Logística (Clases A, B, C, K)", 
              completado: false, 
              progresoLectura: "0/6",
              contenidoHtml: `
                <h3>1.1. Clasificación de Fuegos Estándar</h3>
                <p>Es vital reconocer qué se está quemando antes de actuar para evitar empeorar la situación:</p>
                <ul>
                  <li><b>Clase A:</b> Sólidos comunes con brasa (Cartón, pallets de madera, racks de oficina).</li>
                  <li><b>Clase B:</b> Líquidos y gases inflamables (Lubricantes, combustibles de montacargas, pinturas).</li>
                  <li><b>Clase C:</b> Fuegos bajo tensión eléctrica (Tableros principales, servidores, cableado de carga).</li>
                </ul>
              `
            }
          ]
        },
        {
          id: 2,
          titulo: "Módulo 2: Equipos de Extinción y Planes de Emergencia",
          progreso: 0,
          abierto: false,
          subtemas: [
            { 
              id: "2.0", 
              titulo: "2.0. Inspección Operativa y Uso del Extintor PQS y CO2", 
              completado: false, 
              progresoLectura: "0/5",
              contenidoHtml: `
                <h3>2.0. Operación Eficiente de Extintores Portátiles</h3>
                <p>Frente a un amago de incendio, verifique el manómetro del extintor (debe marcar en la zona verde) y aplique la técnica estándar:</p>
                <ol>
                  <li>Retire el pasador de seguridad rompiendo el precinto plástico.</li>
                  <li>Ubíquese a favor del viento a una distancia segura (3 metros).</li>
                  <li>Apunte la boquilla directamente hacia la <b>base del fuego</b>.</li>
                  <li>Presione el gatillo y realice movimientos de abanico sobre la superficie.</li>
                </ol>
              `
            }
          ]
        }
      ]
    }
  };

  rolUsuario: string = 'Trabajador';
  fechaTexto: string = ''; 
  intervaloSincronizacion: any; 

  checklistData = { 
    kilometraje: '',
    combustible: '1/2',
    luces: 'bueno',
    limpieza: 'bueno',
    herramientas: 'bueno',
    casco: 'bueno', 
    guantes: 'bueno', 
    calzado: 'bueno', 
    obstaculos: 'bueno', 
    iluminacion: 'bueno', 
    observationTexto: '' 
  };
  
  listaReportes: any[] = [];
  listaObservaciones: any[] = [];
  totalCompletados: number = 14;
  totalPendientes: number = 2;

  constructor(private toastCtrl: ToastController, private navCtrl: NavController, private route: ActivatedRoute) {
    addIcons({ 
      calendarOutline, cloudUploadOutline, checkmarkCircle, closeCircle, warningOutline, eyeOutline,
      arrowBackOutline, bookOutline, caretBackOutline, caretForwardOutline, listOutline, documentTextOutline, 
      ellipseOutline, chevronForwardOutline, shieldCheckmarkOutline, documentText, schoolOutline,
      carOutline, speedometerOutline, constructOutline, flashOutline, trashOutline, alertCircleOutline,
      timeOutline, personOutline
    });
  }

  ngOnInit() {
    this.inicializarFechaDinamica();
    this.inyectarDatosMockIniciales(); 
    this.ejecutarVerificacionFuerza();
    this.cargarAvancesDesdeStorage();

    this.route.queryParams.subscribe(params => {
      this.modoCursoActivo = params['verCurso'] === 'true';
      const cursoIdParam = params['cursoId'];

      if (this.modoCursoActivo && cursoIdParam && this.bancoCursos[cursoIdParam]) {
        this.cursoSeleccionadoId = cursoIdParam;
        this.nombreCurso = this.bancoCursos[this.cursoSeleccionadoId].nombre;
        this.modulos = this.bancoCursos[this.cursoSeleccionadoId].modulos;
        
        // Carga la estructura inicial en el visor
        if (this.modulos[0] && this.modulos[0].subtemas[0]) {
          this.subtemaSeleccionado = this.modulos[0].subtemas[0];
        }
        this.actualizarPorcentajesCurso();
      }
    });

    this.intervaloSincronizacion = setInterval(() => { this.ejecutarVerificacionFuerza(); }, 800);
  }

  ngOnDestroy() { if (this.intervaloSincronizacion) clearInterval(this.intervaloSincronizacion); }

  ionViewWillEnter() {
    this.inicializarFechaDinamica();
    this.ejecutarVerificacionFuerza();
  }

  cargarAvancesDesdeStorage() {
    const backupData = localStorage.getItem('isp_progreso_cursos_completo');
    if (backupData) {
      const dbParseada = JSON.parse(backupData);
      Object.keys(dbParseada).forEach(key => {
        if (this.bancoCursos[key]) {
          this.bancoCursos[key].modulos = dbParseada[key].modulos;
        }
      });
    }
  }

  seleccionarSubtema(subtema: Subtema) {
    this.subtemaSeleccionado = subtema;
    // Si no es examen, calculamos el completado de lectura de forma controlada
    if (!subtema.esExamen) {
      this.marcarSubtemaComoLeido(subtema);
    }
  }

  marcarSubtemaComoLeido(subtema: Subtema) {
    if (!subtema.completado) {
      subtema.completado = true;
      const numeros = subtema.progresoLectura.split('/');
      if (numeros.length === 2) {
        subtema.progresoLectura = `${numeros[1]}/${numeros[1]}`; 
      }
      this.guardarYActualizarProgreso();
    }
  }

  // ==========================================================================
  // MOTOR DE EVALUACIONES INTERACTIVAS ACADÉMICAS (ESTILO NETACAD)
  // ==========================================================================
  async evaluarExamenNetacad(subtema: Subtema) {
    if (!subtema.preguntas || subtema.preguntas.length === 0) return;

    // Validación previa: Validar que todas las preguntas tengan una opción marcada
    const sinResponder = subtema.preguntas.some(p => p.respuestaUsuarioIdx === undefined || p.respuestaUsuarioIdx === null);
    if (sinResponder) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, responde todas las preguntas antes de enviar la evaluación.',
        duration: 2500,
        color: 'warning',
        position: 'middle'
      });
      await toast.present();
      return;
    }

    let correctas = 0;
    subtema.preguntas.forEach(preg => {
      if (preg.respuestaUsuarioIdx === preg.respuestaCorrectaIdx) {
        correctas++;
      }
    });

    // Nota basada en porcentaje (0% - 100%)
    subtema.notaFinal = Math.round((correctas / subtema.preguntas.length) * 100);
    subtema.examenRendido = true;

    // Aprueba con 70% o más
    if (subtema.notaFinal >= 70) {
      subtema.completado = true;
      subtema.progresoLectura = 'Aprobado';
      const toast = await this.toastCtrl.create({
        message: `¡Evaluación aprobada con ${subtema.notaFinal}%! Progreso actualizado.`,
        duration: 2000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: `Puntaje insuficiente (${subtema.notaFinal}%). Revisa las respuestas correctas e inténtalo de nuevo.`,
        duration: 3000,
        color: 'danger',
        position: 'top'
      });
      await toast.present();
    }

    this.guardarYActualizarProgreso();
  }

  reintentarExamenNetacad(subtema: Subtema) {
    subtema.examenRendido = false;
    subtema.notaFinal = 0;
    if (subtema.preguntas) {
      subtema.preguntas.forEach(p => p.respuestaUsuarioIdx = null);
    }
    this.guardarYActualizarProgreso();
  }

  private guardarYActualizarProgreso() {
    this.actualizarPorcentajesCurso();
    localStorage.setItem('isp_progreso_cursos_completo', JSON.stringify(this.bancoCursos));
    localStorage.setItem(`progreso_plano_${this.cursoSeleccionadoId}`, this.progresoGlobal.toString());
  }

  actualizarPorcentajesCurso() {
    if (!this.modulos || this.modulos.length === 0) return;

    let subtemasTotalesCurso = 0;
    let subtemasCompletadosCurso = 0;

    this.modulos.forEach(mod => {
      let subtemasTotalesModulo = mod.subtemas.length;
      let subtemasCompletadosModulo = mod.subtemas.filter(s => s.completado).length;

      mod.progreso = subtemasTotalesModulo > 0 ? Math.round((subtemasCompletadosModulo / subtemasTotalesModulo) * 100) : 0;

      subtemasTotalesCurso += subtemasTotalesModulo;
      subtemasCompletadosCurso += subtemasCompletadosModulo;
    });

    this.progresoGlobal = subtemasTotalesCurso > 0 ? Math.round((subtemasCompletadosCurso / subtemasTotalesCurso) * 100) : 0;
  }

  calcularProgresoGlobal() {
    if(this.modulos.length > 0) {
      let totalModulos = this.modulos.length;
      let sumaPorcentajes = this.modulos.reduce((acc, mod) => acc + mod.progreso, 0);
      this.progresoGlobal = Math.round(sumaPorcentajes / totalModulos);
    }
  }

  regresarAlDashboard() {
    this.modoCursoActivo = false;
    this.navCtrl.navigateBack('/tabs/tab1');
  }

  inicializarFechaDinamica() {
    const hoy = new Date();
    this.fechaTexto = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  ejecutarVerificacionFuerza() {
    this.obtenerRolSesion();
    this.cargarDatosCompartidos();
    this.calcularTotalesPanel();
  }

  obtenerRolSesion() {
    const rolGuardado = localStorage.getItem('rolActivo');
    if (rolGuardado) {
      const nuevoRol = rolGuardado.charAt(0).toUpperCase() + rolGuardado.slice(1).toLowerCase();
      if (this.rolUsuario !== nuevoRol) this.rolUsuario = nuevoRol;
    }
  }

  inyectarDatosMockIniciales() {
    const db = localStorage.getItem('db_reportes_diarios');
    if (!db) {
      const datosPrueba = [
        { operario: 'Pedro Alcantara Vega', hora: '07:15 AM', eppCompletos: 3, entornoCorrecto: 2, estadoGeneral: 'correcto', km: '145,210', comb: 'Full' },
        { operario: 'Juan Pérez Martínez', hora: '07:45 AM', eppCompletos: 3, entornoCorrecto: 2, estadoGeneral: 'correcto', km: '98,450', comb: '1/2' },
        { operario: 'Carlos Mendoza Torres', hora: '--:--', eppCompletos: 0, entornoCorrecto: 0, estadoGeneral: 'pendiente', km: '-', comb: '-' }
      ];
      localStorage.setItem('db_reportes_diarios', JSON.stringify(datosPrueba));
    }
  }

  cargarDatosCompartidos() {
    const reportesSucios = localStorage.getItem('db_reportes_diarios');
    this.listaReportes = reportesSucios ? JSON.parse(reportesSucios) : [];
    const observacionesSucias = localStorage.getItem('db_observaciones_alertas');
    this.listaObservaciones = observacionesSucias ? JSON.parse(observacionesSucias) : [];
  }

  calcularTotalesPanel() {
    const completadosFiltro = this.listaReportes.filter(r => r.estadoGeneral === 'correcto' || r.eppCompletos === 3).length;
    this.totalCompletados = 12 + completadosFiltro;
    this.totalPendientes = this.listaReportes.filter(r => r.estadoGeneral === 'pendiente').length;
    if(this.totalPendientes < 0) this.totalPendientes = 0;
  }

  async enviarChecklist() {
    const ahora = new Date();
    const horaActual = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let eppContados = (this.checklistData.casco === 'bueno' ? 1 : 0) + (this.checklistData.guantes === 'bueno' ? 1 : 0) + (this.checklistData.calzado === 'bueno' ? 1 : 0);
    let entornoContados = (this.checklistData.obstaculos === 'bueno' ? 1 : 0) + (this.checklistData.iluminacion === 'bueno' ? 1 : 0);

    const reportesExistentes = localStorage.getItem('db_reportes_diarios');
    let dbReportes = reportesExistentes ? JSON.parse(reportesExistentes) : [];
    const usuarioActivo = localStorage.getItem('correoSesion') || 'Trabajador Activo';
    const nombreFormateado = usuarioActivo.split('@')[0];

    const nuevoReporte = {
      operario: nombreFormateado.charAt(0).toUpperCase() + nombreFormateado.slice(1),
      hora: horaActual, 
      eppCompletos: eppContados, 
      entornoCorrecto: entornoContados,
      estadoGeneral: 'correcto',
      km: this.checklistData.kilometraje || '120,500',
      comb: this.checklistData.combustible
    };
    
    dbReportes = dbReportes.filter((r: any) => r.operario.toLowerCase() !== nuevoReporte.operario.toLowerCase());
    dbReportes.unshift(nuevoReporte);
    localStorage.setItem('db_reportes_diarios', JSON.stringify(dbReportes));
    this.listaReportes = dbReportes; 

    if (this.checklistData.observationTexto.trim() !== '') {
      const observacionesExistentes = localStorage.getItem('db_observaciones_alertas');
      const dbObservaciones = observacionesExistentes ? JSON.parse(observacionesExistentes) : [];
      dbObservaciones.unshift({ operario: nuevoReporte.operario, hora: horaActual, detalle: this.checklistData.observationTexto });
      localStorage.setItem('db_observaciones_alertas', JSON.stringify(dbObservaciones));
      this.listaObservaciones = dbObservaciones; 
    }

    const toast = await this.toastCtrl.create({ message: '¡Checklist diario enviado con éxito!', duration: 2000, color: 'success', position: 'middle' });
    await toast.present();
    
    this.checklistData = { 
      kilometraje: '',
      combustible: '1/2',
      luces: 'bueno',
      limpieza: 'bueno',
      herramientas: 'bueno',
      casco: 'bueno', 
      guantes: 'bueno', 
      calzado: 'bueno', 
      obstaculos: 'bueno', 
      iluminacion: 'bueno', 
      observationTexto: '' 
    };
    this.calcularTotalesPanel();
    localStorage.setItem('checklist_completado_hoy', 'true');
  }

  async eliminarObservacion(index: number) {
    this.listaObservaciones.splice(index, 1);
    localStorage.setItem('db_observaciones_alertas', JSON.stringify(this.listaObservaciones));
    this.calcularTotalesPanel();
  }

  async notificarOmiso(nombre: string) {
    const toast = await this.toastCtrl.create({ message: `Alerta enviada al dispositivo de ${nombre}.`, duration: 2000, color: 'danger', position: 'top' });
    await toast.present();
  }

  async marcarComoRevisado() {
    const toast = await this.toastCtrl.create({ message: 'Observación archivada como revisada.', duration: 1500, color: 'dark', position: 'bottom' });
    await toast.present();
  }
}