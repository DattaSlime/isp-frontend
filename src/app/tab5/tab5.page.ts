import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule, NavController, ToastController, ActionSheetController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  businessOutline, 
  idCardOutline, 
  mailOutline, 
  logOutOutline, 
  optionsOutline, 
  cameraOutline, 
  imageOutline, 
  gridOutline, 
  closeOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class Tab5Page implements OnInit {
  
  @ViewChild('inputGaleria') inputGaleria!: ElementRef;

  // Valores iniciales por defecto (Estado limpio)
  nombreUsuario: string = 'Usuario';
  correoUsuario: string = 'usuario@gmail.com';
  rolUsuario: string = 'Trabajador';
  codigoEmpleado: string = 'EMP-2026-9482';
  avatarDinamico: string = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  esCuentaSupervisorOriginal: boolean = false;
  mostrarModalAvatares: boolean = false;

  // Repositorio de avatares predeterminados de Unsplash (Estilo corporativo/planta)
  listaAvataresPredeterminados: string[] = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
  ];

  constructor(
    private navCtrl: NavController, 
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({ 
      businessOutline, 
      idCardOutline, 
      mailOutline, 
      logOutOutline, 
      optionsOutline, 
      cameraOutline, 
      imageOutline, 
      gridOutline, 
      closeOutline 
    });
  }

  ngOnInit() {
    this.inicializarComponente();
  }

  ionViewWillEnter() {
    this.inicializarComponente();
  }

  // Orquestador central para garantizar orden en la carga de datos
  inicializarComponente() {
    this.resetearEstadoLocal();
    this.verificarNivelAccesoOriginal();
    this.cargarDatosUsuario();
  }

  // Restablece las variables antes de leer el almacenamiento para evitar persistencias fantasmas
  resetearEstadoLocal() {
    this.nombreUsuario = 'Usuario';
    this.correoUsuario = 'usuario@gmail.com';
    this.rolUsuario = 'Trabajador';
    this.codigoEmpleado = 'EMP-2026-9482';
    this.avatarDinamico = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
    this.esCuentaSupervisorOriginal = false;
  }

  verificarNivelAccesoOriginal() {
    const correoActivo = localStorage.getItem('correoSesion') || '';
    const usuarioISP = localStorage.getItem('usuarioISP');
    
    let rolBase = '';
    if (usuarioISP) {
      try { rolBase = JSON.parse(usuarioISP).rol || ''; } catch(e){}
    }

    if (
      correoActivo.includes('supervisor') || 
      rolBase.toLowerCase() === 'supervisor' || 
      correoActivo.includes('cordova') || 
      correoActivo.includes('admin')
    ) {
      this.esCuentaSupervisorOriginal = true;
    } else {
      this.esCuentaSupervisorOriginal = false;
    }
  }

  cargarDatosUsuario() {
    const nombreActivo = localStorage.getItem('nombreSesion');
    const correoActivo = localStorage.getItem('correoSesion');
    const rolActivo = localStorage.getItem('rolActive') || localStorage.getItem('rolActivo');
    
    if (nombreActivo) this.nombreUsuario = nombreActivo;
    if (correoActivo) this.correoUsuario = correoActivo;

    // Vinculamos de forma segura el caché de la foto de perfil al correo del usuario actual
    const avatarGuardado = localStorage.getItem(`avatar_${this.correoUsuario}`);

    if (avatarGuardado && correoActivo) {
      this.avatarDinamico = avatarGuardado;
    } else {
      // Evitamos asignar perfiles de administración si no hay sesión válida o real activa
      if (this.correoUsuario !== 'usuario@gmail.com' && 
         (this.nombreUsuario.toLowerCase().includes('crhistian') || 
          this.nombreUsuario.toLowerCase().includes('cordova') || 
          this.correoUsuario.includes('admin'))) {
        this.avatarDinamico = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
        this.codigoEmpleado = 'SUP-2026-0041';
      } else {
        this.avatarDinamico = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
        this.codigoEmpleado = 'EMP-2026-8842';
      }
    }

    if (rolActivo) {
      this.rolUsuario = rolActivo.charAt(0).toUpperCase() + rolActivo.slice(1).toLowerCase();
    }
  }

  async presentarOpcionesImagen() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Actualizar foto de perfil',
      buttons: [
        {
          text: 'Elegir desde la Galería',
          icon: 'image-outline',
          handler: () => {
            this.inputGaleria.nativeElement.click();
          }
        },
        {
          text: 'Usar imagen predeterminada',
          icon: 'grid-outline',
          handler: () => {
            this.mostrarModalAvatares = true;
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  cargarDesdeGaleria(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = () => {
        const base64Result = lector.result as string;
        this.avatarDinamico = base64Result;
        localStorage.setItem(`avatar_${this.correoUsuario}`, base64Result);
        this.mostrarToastMensaje('Foto de perfil actualizada desde la galería.');
      };
      lector.readAsDataURL(archivo);
    }
  }

  seleccionarAvatarPredeterminado(urlAvatar: string) {
    this.avatarDinamico = urlAvatar;
    localStorage.setItem(`avatar_${this.correoUsuario}`, urlAvatar);
    this.mostrarModalAvatares = false;
    this.mostrarToastMensaje('Avatar corporativo asignado con éxito.');
  }

  async mostrarToastMensaje(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  async cambiarEntornoSimulado(event: any) {
    const nuevoRolSeleccionado = event.detail.value;
    localStorage.setItem('rolActivo', nuevoRolSeleccionado);
    localStorage.setItem('rolActive', nuevoRolSeleccionado);

    this.rolUsuario = nuevoRolSeleccionado.charAt(0).toUpperCase() + nuevoRolSeleccionado.slice(1).toLowerCase();

    const toast = await this.toastCtrl.create({
      message: `Entorno cambiado a: VISTA ${this.rolUsuario.toUpperCase()}`,
      duration: 1500,
      color: nuevoRolSeleccionado === 'supervisor' ? 'secondary' : 'primary',
      position: 'top'
    });
    await toast.present();
  }

  // Cierre de sesión limpio: Borra credenciales pero preserva las imágenes de perfil locales
  async cerrarSesion() {
    localStorage.removeItem('nombreSesion');
    localStorage.removeItem('correoSesion');
    localStorage.removeItem('rolActivo');
    localStorage.removeItem('rolActive');
    localStorage.removeItem('usuarioISP');
    
    setTimeout(() => {
      this.navCtrl.navigateRoot('/login', {
        animated: true,
        animationDirection: 'back'
      });
    }, 150);
  }
}