import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-empleado',
  templateUrl: './registro-empleado.page.html',
  styleUrls: ['./registro-empleado.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class RegistroEmpleadoPage implements OnInit {

  // Variables vinculadas al ngModel del HTML
  nombre: string = '';
  rol: string = '';
  correo: string = '';
  password: string = '';

  constructor(
    private navCtrl: NavController, 
    private toastCtrl: ToastController
  ) { }

  ngOnInit() { }

  async registrarUsuario() {
    // Validar que los campos críticos contengan información
    if (this.correo.trim() === '' || this.password.trim() === '') {
      this.mostrarNotificacion('El correo y la contraseña son obligatorios.', 'warning');
      return;
    }

    const correoLimpio = this.correo.trim().toLowerCase();

    // Estructuramos el objeto limpiando espacios en blanco accidentales
    const datosUsuario = {
      nombre: this.nombre.trim(),
      rol: this.rol || 'trabajador',
      correo: correoLimpio,
      password: this.password.trim()
    };

    try {
      // MODIFICACIÓN MULTIUSUARIO: Guardamos la cuenta usando el correo como identificador único.
      // Así permitimos que coexistan múltiples usuarios registrados en este mismo dispositivo compartida.
      localStorage.setItem(`user_${correoLimpio}`, JSON.stringify(datosUsuario));

      this.mostrarNotificacion('¡REGISTRO EXITOSO! Ya puedes iniciar sesión.', 'success');
      
      // Forzar redirección al login
      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      this.mostrarNotificacion('Error al guardar datos en el dispositivo.', 'danger');
    }
  }

  async mostrarNotificacion(msg: string, varianteColor: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      color: varianteColor,
      position: 'middle'
    });
    await toast.present();
  }
}