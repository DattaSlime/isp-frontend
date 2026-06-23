import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // <-- Conecta directo con el Backend de SQL Server
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonList, 
  IonListHeader, 
  IonLabel, 
  IonItem, 
  IonToggle, 
  IonRadioGroup, 
  IonRadio, 
  IonTextarea, 
  IonButton, 
  IonIcon 
} from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { clipboardOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.page.html',
  styleUrls: ['./checklist.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonList, 
    IonListHeader, 
    IonLabel, 
    IonItem, 
    IonToggle, 
    IonRadioGroup, 
    IonRadio, 
    IonTextarea, 
    IonButton, 
    IonIcon,
    CommonModule, 
    FormsModule
  ]
})
export class ChecklistPage implements OnInit {

  // Variables de control enlazadas al HTML con [(ngModel)]
  usaEppAdecuado: boolean = false;
  herramientasEnBuenEstado: boolean = false;
  estadoSaludActual: string = 'Optimo'; // 'Optimo', 'Regular' o 'Malestar'
  observacionesAdicionales: string = '';

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private http: HttpClient // <-- Inyectamos el cliente HTTP para conectar al backend
  ) {
    // Registro explícito de los íconos necesarios para componentes Standalone
    addIcons({ clipboardOutline, saveOutline });
  }

  ngOnInit() { }

  // Función para procesar y mandar el checklist diario a SQL Server
  async guardarChecklist() {
    const salud = this.estadoSaludActual;
    const observaciones = this.observacionesAdicionales.trim();

    // Jalamos los datos reales del usuario que inició sesión en el Login
    const sesionUsuario = localStorage.getItem('usuarioISP');
    let usuarioId = 2; // Usuario de respaldo por defecto (Bob Esponja ID 2)

    if (sesionUsuario) {
      const userObj = JSON.parse(sesionUsuario);
      usuarioId = userObj.usuario_id; // Jala dinámicamente el id que devolvió SQL Server
    }

    // JSON relacional exacto estructurado con los campos que tu base de datos necesita
    const datosChecklist = {
      usuario_id: usuarioId,
      cumple_epp: this.usaEppAdecuado ? 1 : 0,           // El tipo BIT en SQL Server recibe 1 o 0
      herramientas_optimas: this.herramientasEnBuenEstado ? 1 : 0, // El tipo BIT en SQL Server recibe 1 o 0
      condicion_salud: salud,
      observaciones: observaciones !== '' ? observaciones : 'Sin observaciones por el empleado.'
    };

    // Petición POST en tiempo real hacia la API de Node.js
    this.http.post('http://localhost:3000/api/checklist', datosChecklist).subscribe({
      next: async (res) => {
        await this.mostrarAlerta('📋 ¡Checklist de SST guardado con éxito en SQL Server!', 'success');
        
        // Limpiar el formulario por completo tras un registro exitoso
        this.usaEppAdecuado = false;
        this.herramientasEnBuenEstado = false;
        this.estadoSaludActual = 'Optimo';
        this.observacionesAdicionales = '';

        // Regresar automáticamente al menú principal (tabs)
        this.navCtrl.back();
      },
      error: async (err) => {
        console.error('Error al insertar Checklist:', err);
        await this.mostrarAlerta('❌ Error de conexión: No se pudo registrar en la Base de Datos.', 'danger');
      }
    });
  }

  // Notificaciones flotantes interactivas corporativas
  async mostrarAlerta(msg: string, colorVariante: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: colorVariante,
      position: 'bottom'
    });
    await toast.present();
  }
}