import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro-empresa',
  templateUrl: './registro-empresa.page.html',
  styleUrls: ['./registro-empresa.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class RegistroEmpresaPage implements OnInit {

  nombreEmpresa: string = '';
  ruc: string = '';

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() { }

  async crearEmpresa() {
    if (this.nombreEmpresa && this.ruc) {
      const toast = await this.toastCtrl.create({
        message: 'Empresa registrada correctamente',
        duration: 2000,
        color: 'secondary',
        position: 'bottom'
      });
      await toast.present();
      
      this.navCtrl.navigateRoot('/login');
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Por favor complete los datos de la empresa',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
    }
  }
}