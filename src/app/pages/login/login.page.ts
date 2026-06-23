import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // <-- AGREGADO: Para conectar con SQL Server

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class LoginPage implements OnInit {

  // Tus variables de enlace originales intactas
  userEmail: string = '';
  userPass: string = '';

  // PROPIEDADES ENLAZADAS AL NUEVO FORMULARIO BRUTALISTA (Mantenidas al 100%)
  recoveryEmail: string = '';
  recoveryCode: string = '';
  recoveryNewPass: string = '';
  recoveryConfirmPass: string = '';

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private http: HttpClient // <-- AGREGADO: Inyectamos el cliente HTTP para el backend
  ) { }

  ngOnInit() { }

  // Modificado de onLogin para conectar dinámicamente con tu Backend y SQL Server
  async onLogin() {
    const correoIngresado = this.userEmail.trim();
    const passwordIngresado = this.userPass.trim();

    // Tu validación obligatoria original
    if (correoIngresado === '' || passwordIngresado === '') {
      this.mostrarAlerta('Por favor, complete todos los campos.', 'warning');
      return;
    }

    this.limpiarSesionPrevia();

    // Objeto con la estructura relacional que espera el backend
    const credenciales = {
      correo: correoIngresado,
      password: passwordIngresado
    };

    // Petición HTTP POST real hacia la tabla Usuarios de SQL Server
    this.http.post<any>('http://localhost:3000/api/login', credenciales).subscribe({
      next: async (respuesta) => {
        if (respuesta.success) {
          // Extraemos los datos dinámicos devueltos desde SQL Server
          const cuenta = respuesta.usuario;
          const rolAsignado = cuenta.rol || 'trabajador';
          const nombreDetectado = cuenta.nombre_completo || 'Trabajador ISP';
          const correoRegistrado = cuenta.correo;

          // Conservamos TODAS tus asignaciones originales de LocalStorage
          localStorage.setItem('rolActivo', rolAsignado);
          localStorage.setItem('rolActive', rolAsignado);
          localStorage.setItem('usuarioISP', JSON.stringify(cuenta));
          localStorage.setItem('correoSesion', correoRegistrado);
          localStorage.setItem('nombreSesion', nombreDetectado);
          
          await this.mostrarAlerta(`¡Bienvenido al Sistema, ${nombreDetectado}!`, 'success');

          // Redirección hacia las pestañas de navegación principal
          this.navCtrl.navigateRoot('/tabs');
        }
      },
      error: async (err) => {
        console.error('Error de autenticación en SQL:', err);
        if (err.status === 401) {
          this.mostrarAlerta('Correo o contraseña incorrectos.', 'danger');
        } else {
          this.mostrarAlerta('❌ Error de conexión: El backend no está encendido.', 'danger');
        }
      }
    });
  }

  // ========================================================
  // LÓGICA DE CONTROL DEL MOCKUP DE RECUPERACIÓN (MANTENIDA INTACTA)
  // ========================================================

  async enviarCodigoVerificacion() {
    const emailInput = this.recoveryEmail.trim();
    if (!emailInput) {
      this.mostrarAlerta('Por favor, ingrese un correo válido para enviar el código.', 'warning');
      return;
    }
    this.mostrarAlerta(`🔢 Código de confirmación enviado a: ${emailInput.toLowerCase()}`, 'success');
  }

  async ejecutarActualizacion(modalRef: any) {
    const email = this.recoveryEmail.trim().toLowerCase();
    const codigo = this.recoveryCode.trim();
    const pass = this.recoveryNewPass.trim();
    const confirm = this.recoveryConfirmPass.trim();

    // Validar rellenado obligatorio
    if (!email || !codigo || !pass || !confirm) {
      this.mostrarAlerta('Debe rellenar todos los recuadros del formulario.', 'warning');
      return;
    }

    // Validar coincidencia
    if (pass !== confirm) {
      this.mostrarAlerta('La nueva contraseña y la confirmación no coinciden.', 'danger');
      return;
    }

    // Buscar usuario en LocalStorage para guardar la nueva clave de contingencia local
    const userKey = `user_${email}`;
    const localUser = localStorage.getItem(userKey);

    if (localUser) {
      try {
        const userObj = JSON.parse(localUser);
        userObj.password = pass; // Actualizar campo
        localStorage.setItem(userKey, JSON.stringify(userObj));
      } catch (err) {
        console.error(err);
      }
    } else if (email === 'admin@gmail.com') {
      this.mostrarAlerta('Contraseña maestra de contingencia actualizada.', 'success');
    }

    // Feedback de éxito e inicialización de variables
    this.mostrarAlerta('🔒 Contraseña guardada y actualizada con éxito.', 'success');
    
    this.recoveryEmail = '';
    this.recoveryCode = '';
    this.recoveryNewPass = '';
    this.recoveryConfirmPass = '';

    // Cerrar el modal actual
    modalRef.dismiss();
  }

  // Tu limpiador original de persistencia
  limpiarSesionPrevia() {
    localStorage.removeItem('nombreSesion');
    localStorage.removeItem('correoSesion');
    localStorage.removeItem('rolActivo');
    localStorage.removeItem('rolActive');
    localStorage.removeItem('usuarioISP');
  }

  // Tu disparador original de notificaciones flotantes
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