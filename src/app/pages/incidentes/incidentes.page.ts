import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // <-- AGREGADO: Para conectar con SQL Server
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonList, 
  IonItem, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonTextarea, 
  IonButton, 
  IonIcon 
} from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.page.html',
  styleUrls: ['./incidentes.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonBackButton, 
    IonList, 
    IonItem, 
    IonInput, 
    IonSelect, 
    IonSelectOption, 
    IonTextarea, 
    IonButton, 
    IonIcon,
    CommonModule, 
    FormsModule
  ]
})
export class IncidentesPage implements OnInit {

  // Variables de control enlazadas al HTML con [(ngModel)]
  tipoIncidencia: string = 'Tranquila'; // 'Tranquila' o 'Alta'
  tituloIncidente: string = '';
  areaSeleccionadaId: number | null = null; // <-- CAMBIADO: Ahora guarda el ID numérico de la tabla Areas de SQL
  descripcionDetallada: string = '';
  
  // URL de la foto que se mostrará al presionar el botón
  fotoEvidencia: string | null = null;

  // Lista para almacenar las áreas traídas dinámicamente de SQL Server
  listaAreas: any[] = [];

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private http: HttpClient // <-- AGREGADO: Inyectamos el cliente HTTP para el backend
  ) {
    // Registro explícito de íconos para componentes Standalone
    addIcons({ cameraOutline, checkmarkCircleOutline });
  }

  ngOnInit() { 
    this.cargarAreasDesdeSQL(); // <-- AGREGADO: Al cargar la pantalla, lee las áreas de la base de datos
  }

  // Trae las áreas reales de la tabla de SQL Server
  cargarAreasDesdeSQL() {
    this.http.get<any[]>('http://localhost:3000/api/areas').subscribe({
      next: (res) => { 
        this.listaAreas = res; 
      },
      error: (err) => {
        console.error('Error al conectar con SQL Server:', err);
      }
    });
  }

  // Función interactiva de la cámara usando un enlace de internet universal
  adjuntarFoto() {
    this.fotoEvidencia = 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=600';
    this.mostrarAlerta('📸 Evidencia fotográfica acoplada correctamente.', 'success');
  }

  // Envío del reporte conectado directamente al backend dinámico de SQL Server
  async enviarReporte() {
    const titulo = this.tituloIncidente.trim();
    const descripcion = this.descripcionDetallada.trim();

    // Validar rellenado obligatorio (Verifica que se seleccione un área de SQL Server)
    if (titulo === '' || !this.areaSeleccionadaId || descripcion === '') {
      this.mostrarAlerta('Por favor, complete todos los campos obligatorios.', 'warning');
      return;
    }

    // Tu validación original intacta: Mínimo 10 letras en la descripción
    if (descripcion.length < 10) {
      this.mostrarAlerta('La descripción debe ser más detallada (mínimo 10 letras).', 'warning');
      return;
    }

    // Estructura relacional exacta que tu tabla 'Incidentes' en SQL Server necesita
    const nuevoReporte = {
      usuario_id: 2, // Mapeado por defecto a tu usuario de pruebas (Bob Esponja ID 2)
      area_id: this.areaSeleccionadaId, // El ID de la tabla Areas elegido en el desplegable
      tipo: this.tipoIncidencia,
      titulo: titulo,
      descripcion: descripcion,
      foto_evidencia: this.fotoEvidencia
    };

    // Hacemos la petición POST real hacia el backend puente de Node.js
    this.http.post('http://localhost:3000/api/incidentes', nuevoReporte).subscribe({
      next: async (res) => {
        // Tu lógica de mensajes flotantes condicionales según la gravedad
        if (this.tipoIncidencia === 'Alta') {
          await this.mostrarAlerta('🚨 EMERGENCIA CRÍTICA notificada e insertada en SQL Server.', 'danger');
        } else {
          await this.mostrarAlerta('✅ Reporte de incidencia ordinaria guardado en SQL Server.', 'success');
        }

        // Limpiar el formulario por completo
        this.tituloIncidente = '';
        this.areaSeleccionadaId = null;
        this.descripcionDetallada = '';
        this.fotoEvidencia = null;

        // Regresar automáticamente a la pantalla anterior
        this.navCtrl.back();
      },
      error: async (err) => {
        console.error(err);
        await this.mostrarAlerta('❌ Error de conexión: No se pudo guardar en SQL Server.', 'danger');
      }
    });
  }

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