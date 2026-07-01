import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-curso-viewer',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './curso-viewer.page.html',
  styleUrls: ['./curso-viewer.page.scss']
})
export class CursoViewerPage implements OnInit {

  titulo = '';

  pdfSrc = '';

  paginaActual = 1;

  totalPaginas = 1;

  progreso = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    const datos = history.state;

    if (datos.curso) {

      this.titulo = datos.curso.titulo;

      if (this.titulo.includes('protección')) {
        this.pdfSrc = 'assets/pdf/epp.pdf';
      }

      else if (this.titulo.includes('incendios')) {
        this.pdfSrc = 'assets/pdf/incendios.pdf';
      }

      else {
        this.pdfSrc = datos.curso.blobData;
      }

    }

  }

  volver() {
    this.router.navigate(['/tabs/tab2']);
  }

  paginaAnterior() {

    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.calcularProgreso();
    }

  }

  paginaSiguiente() {

    this.paginaActual++;

    this.calcularProgreso();

  }

  pdfCargado(pdf: any) {

    this.totalPaginas = pdf.numPages;

  }

  calcularProgreso() {

    this.progreso = Math.round(
      (this.paginaActual / this.totalPaginas) * 100
    );

  }

  iniciarEvaluacion() {

    alert('Aquí aparecerá el examen.');

  }

}