import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  bookOutline, 
  checkboxOutline, 
  warningOutline, // El nombre correcto del ícono de alertas en Ionic
  personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class TabsPage {

  constructor() {
    // Registramos los íconos nativos con sus nombres reales corregidos
    addIcons({ 
      'home-outline': homeOutline, 
      'book-outline': bookOutline, 
      'checkbox-outline': checkboxOutline, 
      'alert-triangle-outline': warningOutline, // Mapeamos el nombre que pusiste en el HTML al ícono real
      'person-outline': personOutline 
    });
  }

}