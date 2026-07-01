import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'registro-empleado',
    loadComponent: () => import('./pages/registro-empleado/registro-empleado.page').then( m => m.RegistroEmpleadoPage)
  },
  {
    path: 'registro-empresa',
    loadComponent: () => import('./pages/registro-empresa/registro-empresa.page').then( m => m.RegistroEmpresaPage)
  },
  {
    path: 'tab4',
    loadComponent: () => import('./tab4/tab4.page').then( m => m.Tab4Page)
  },
  {
    path: 'tab5',
    loadComponent: () => import('./tab5/tab5.page').then( m => m.Tab5Page)
  },

  // 👇 NUEVA RUTA
  {
    path: 'curso-viewer',
    loadComponent: () =>
      import('./curso-viewer/curso-viewer.page').then(
        m => m.CursoViewerPage
      )
  }

];