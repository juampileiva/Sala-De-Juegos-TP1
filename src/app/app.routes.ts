import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Home } from './pages/home/home';
import { QuienSoy } from './pages/quien-soy/quien-soy';

import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login, canActivate: [noAuthGuard] },
  { path: 'registro', component: Registro, canActivate: [noAuthGuard] },
  { path: 'quien-soy', component: QuienSoy },
  { path: '**', redirectTo: '' }
];