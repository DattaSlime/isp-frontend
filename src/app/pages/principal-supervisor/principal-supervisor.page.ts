import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-principal-supervisor',
  templateUrl: './principal-supervisor.page.html',
  styleUrls: ['./principal-supervisor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PrincipalSupervisorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
