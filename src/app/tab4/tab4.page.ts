import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  locationOutline, 
  alertCircleOutline, 
  addCircleOutline, 
  timeOutline, 
  checkmarkCircleOutline,
  sendOutline,
  cubeOutline,   // Icono agregado
  cartOutline    // Icono agregado
} from 'ionicons/icons';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab4Page implements OnInit {

  rolUsuario: string = 'Trabajador';
  tipoReporteActivo: string = 'incidencia'; // Controla la pestaña activa
  listaIncidencias: any[] = [];
  listaInsumos: any[] = [];

  nuevoIncidente = {
    tipo: 'CRÍTICO',
    titulo: '',
    descripcion: '',
    ubicacion: 'Almacén Central - Sector B'
  };

  // Nuevo objeto para el formulario de materiales faltantes
  nuevoMaterialFaltante = {
    material: '',
    urgencia: 'ALTA',
    ubicacion: 'Almacén Central - Sector B',
    comentario: ''
  };

  constructor(private toastCtrl: ToastController) {
    addIcons({ 
      locationOutline, 
      alertCircleOutline, 
      addCircleOutline,
      timeOutline,
      checkmarkCircleOutline,
      sendOutline,
      cubeOutline,
      cartOutline
    });
  }

  ngOnInit() {
    this.sincronizarVistaYDatos();
  }

  ionViewWillEnter() {
    this.sincronizarVistaYDatos();
  }

  sincronizarVistaYDatos() {
    this.obtenerRolSesion();
    this.cargarHistorialIncidencias();
    this.sincronizarInsumos();
  }

  obtenerRolSesion() {
    const rolGuardado = localStorage.getItem('rolActivo') || localStorage.getItem('rol');
    if (rolGuardado) {
      this.rolUsuario = rolGuardado.charAt(0).toUpperCase() + rolGuardado.slice(1).toLowerCase();
    }
  }

  cargarHistorialIncidencias() {
    const db = localStorage.getItem('db_historial_incidencias');
    if (db) {
      this.listaIncidencias = JSON.parse(db);
    } else {
      this.listaIncidencias = [
        {
          tipo: 'CRÍTICO',
          titulo: 'Falta de EPP en Zona de Despacho',
          descripcion: 'Se ha reportado personal operando montacargas sin el calzado de seguridad obligatorio.',
          ubicacion: 'Almacén Central - Sector B',
          tiempo: 'Hace 10 min',
          remitente: 'Carlos Mendoza (Mantenimiento)'
        },
        {
          tipo: 'ADVERTENCIA',
          titulo: 'Mantenimiento de Extintores Próximo',
          descripcion: 'Los equipos contra incendios del área administrativa vencen a fin de mes.',
          ubicacion: 'Oficinas Piso 2',
          tiempo: 'Hace 1 hora',
          remitente: 'Sistema de Seguridad'
        }
      ];
      this.guardarEnDispositivo();
    }
  }

  sincronizarInsumos() {
    const dbInsumos = localStorage.getItem('db_insumos');
    let insumosTemporales = dbInsumos ? JSON.parse(dbInsumos) : [];
    
    if (insumosTemporales.length === 0) {
      insumosTemporales = [
        { id: 'ins_1', nombre: 'Kit de Primeros Auxilios Tipo A', lote: 'LT-9921', fechaVencimiento: '2026-05-20' },
        { id: 'ins_2', nombre: 'Reactivo de Limpieza Sanitaria', lote: 'LT-4402', fechaVencimiento: '2026-06-10' },
        { id: 'ins_3', nombre: 'Arnés de Seguridad Altura - 3M', lote: 'LT-1108', fechaVencimiento: '2026-12-15' }
      ];
      localStorage.setItem('db_insumos', JSON.stringify(insumosTemporales));
    }

    this.listaInsumos = this.procesarVencimientosInsumos(insumosTemporales);
  }

  procesarVencimientosInsumos(insumos: any[]): any[] {
    const hoy = new Date();
    return insumos.map((insumo: any) => {
      const fechaVenc = new Date(insumo.fechaVencimiento);
      const diferenciaTiempo = fechaVenc.getTime() - hoy.getTime();
      const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      if (diferenciaDias <= 0) {
        insumo.estadoCalculado = 'Vencido';
        insumo.colorAlerta = 'danger';
      } else if (diferenciaDias <= 15) {
        insumo.estadoCalculado = 'Por Vencer';
        insumo.colorAlerta = 'warning';
      } else {
        insumo.estadoCalculado = 'Vigente';
        insumo.colorAlerta = 'success';
      }
      return insumo;
    });
  }

  async registrarIncidenciaCritica() {
    if (!this.nuevoIncidente.titulo.trim() || !this.nuevoIncidente.descripcion.trim()) {
      alert('Por favor, completa los campos requeridos.');
      return;
    }

    const usuarioLogueado = localStorage.getItem('nombreSesion') || 
                            localStorage.getItem('nombreSession') || 
                            localStorage.getItem('usuarioActivo') || 
                            'Operario de Planta';

    const reporteFinal = {
      tipo: this.nuevoIncidente.tipo,
      titulo: this.nuevoIncidente.titulo,
      descripcion: this.nuevoIncidente.descripcion,
      ubicacion: this.nuevoIncidente.ubicacion,
      tiempo: 'Hace un momento',
      remitente: usuarioLogueado
    };

    this.listaIncidencias.unshift(reporteFinal);
    this.guardarEnDispositivo();

    const kpiActual = parseInt(localStorage.getItem('kpi_incidentes_totales') || '5', 10);
    localStorage.setItem('kpi_incidentes_totales', (kpiActual + 1).toString());

    this.nuevoIncidente.titulo = '';
    this.nuevoIncidente.descripcion = '';

    const toast = await this.toastCtrl.create({
      message: '🚨 ¡ALERTA ENVIADA! Notificación crítica despachada.',
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  // NUEVA FUNCIÓN: Registrar desabastecimiento de materiales
  async registrarMaterialFaltante() {
    if (!this.nuevoMaterialFaltante.material.trim()) {
      alert('Por favor, indica qué material hace falta.');
      return;
    }

    const usuarioLogueado = localStorage.getItem('nombreSesion') || 
                            localStorage.getItem('nombreSession') || 
                            localStorage.getItem('usuarioActivo') || 
                            'Operario de Planta';

    const reporteMaterial = {
      tipo: 'MATERIAL',
      titulo: `Falta de Material: ${this.nuevoMaterialFaltante.material}`,
      descripcion: `Urgencia ${this.nuevoMaterialFaltante.urgencia}. Observaciones: ${this.nuevoMaterialFaltante.comentario || 'Sin detalles adicionales.'}`,
      ubicacion: this.nuevoMaterialFaltante.ubicacion,
      tiempo: 'Hace un momento',
      remitente: usuarioLogueado
    };

    this.listaIncidencias.unshift(reporteMaterial);
    this.guardarEnDispositivo();

    // Limpiar campos del formulario
    this.nuevoMaterialFaltante.material = '';
    this.nuevoMaterialFaltante.comentario = '';

    const toast = await this.toastCtrl.create({
      message: '📦 ¡REQUERIMIENTO ENVIADO! Alerta de reabastecimiento registrada.',
      duration: 3000,
      color: 'warning',
      position: 'top'
    });
    await toast.present();
  }

  async resolverIncidente(index: number) {
    this.listaIncidencias.splice(index, 1);
    this.guardarEnDispositivo();

    const kpiActual = parseInt(localStorage.getItem('kpi_incidentes_totales') || '5', 10);
    localStorage.setItem('kpi_incidentes_totales', Math.max(0, kpiActual - 1).toString());

    const toast = await this.toastCtrl.create({
      message: 'Registro gestionado correctamente.',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }

  guardarEnDispositivo() {
    localStorage.setItem('db_historial_incidencias', JSON.stringify(this.listaIncidencias));
  }
}