import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { IonicModule, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  alertCircle, 
  playBack, 
  playCircle, 
  playForward, 
  easelOutline, 
  chevronForwardOutline, 
  closeCircleOutline, 
  checkboxOutline,
  shieldHalf,
  warning,
  notifications,
  checkmarkCircle,            // Icono agregado
  checkmarkDoneCircleOutline   // Icono agregado
} from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab1Page implements OnInit {

  rolUsuario: string = 'Trabajador';
  alertasContador: number = 2;
  
  // Bandera de control dinámico del Checklist diario
  checklistCompletado: boolean = false;

  // NUEVAS VARIABLES PARA SEGUIMIENTO DE PROGRESO DE AMBOS CURSOS
  progresoEpp: number = 0;
  progresoIncendios: number = 0;

  constructor(private navCtrl: NavController) {
    addIcons({ 
      alertCircle, 
      playBack, 
      playCircle, 
      playForward, 
      easelOutline, 
      chevronForwardOutline, 
      closeCircleOutline, 
      checkboxOutline,
      shieldHalf,
      warning,
      notifications,
      checkmarkCircle,
      checkmarkDoneCircleOutline
    });
  }

  ngOnInit() {
    this.sincronizarDatosDashboard();
  }

  ionViewWillEnter() {
    this.sincronizarDatosDashboard();
    
    // Recuperar y actualizar el progreso de lectura guardado en tiempo real desde el Tab3
    const eppStored = localStorage.getItem('progreso_plano_epp');
    this.progresoEpp = eppStored ? parseInt(eppStored, 10) : 0;

    const incendiosStored = localStorage.getItem('progreso_plano_incendios');
    this.progresoIncendios = incendiosStored ? parseInt(incendiosStored, 10) : 0;
  }

  sincronizarDatosDashboard() {
    this.obtenerRolSesion();
    this.calcularIncidentesVigentes();
    this.verificarEstadoChecklist();
  }

  obtenerRolSesion() {
    const rolGuardado = localStorage.getItem('rolActivo') || localStorage.getItem('rol');
    if (rolGuardado) {
      this.rolUsuario = rolGuardado.charAt(0).toUpperCase() + rolGuardado.slice(1).toLowerCase();
    }
  }

  // Comprueba cuántas incidencias hay registradas en la base de datos de Alertas
  calcularIncidentesVigentes() {
    const dbAlertas = localStorage.getItem('db_historial_incidencias');
    if (dbAlertas) {
      try {
        const lista = JSON.parse(dbAlertas);
        this.alertasContador = lista.length;
      } catch (e) {
        this.alertasContador = 2;
      }
    } else {
      this.alertasContador = 2;
    }
  }

  // Verifica dinámicamente si el checklist obligatorio ya se completó el día de hoy
  verificarEstadoChecklist() {
    const estado = localStorage.getItem('checklist_completado_hoy');
    this.checklistCompletado = (estado === 'true');
  }

  // ==========================================
  // METODOS DE ENRUTAMIENTO DINÁMICO DE CURSOS
  // ==========================================
  abrirCursoEstructura(idCurso: string) {
    this.navCtrl.navigateForward('/tabs/tab3', {
      queryParams: {
        verCurso: 'true',
        cursoId: idCurso
      }
    });
  }

  // ==========================================
  // METODOS DE ENRUTAMIENTO DIRECTO EN PESTAÑAS
  // ==========================================

  irACapacitaciones() {
    // Viaja a la pestaña 3 pero inyectándole la bandera para encender el curso por defecto (epp)
    this.navCtrl.navigateForward('/tabs/tab3', {
      queryParams: { 
        verCurso: 'true',
        cursoId: 'epp'
      }
    });
  }

  irAChecklist() {
    this.navCtrl.navigateForward('/tabs/tab3');
  }

  irAAlertas() {
    this.navCtrl.navigateForward('/tabs/tab4');
  }
}