import { Routes } from '@angular/router';
import { UsuariosListaComponent } from './usuarios-lista/usuarios-lista.component';
import { FormularioUsuarioComponent } from './components/formulario-usuario/formulario-usuario.component';
import { UsuarioDetalleComponent } from './usuario-detalle/usuario-detalle.component';

export const usuariosRoutes: Routes = [
  {
    path: '',
    component: UsuariosListaComponent
  },
  {
    path: 'nuevo',
    component: FormularioUsuarioComponent
  },
  {
    path: 'editar/:id',
    component: FormularioUsuarioComponent
  },
  {
    path: ':id',
    component: UsuarioDetalleComponent
  }
];
