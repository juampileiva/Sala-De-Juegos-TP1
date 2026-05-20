import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Home } from './pages/home/home';
import { QuienSoy } from './pages/quien-soy/quien-soy';

import { Ahorcado } from './pages/ahorcado/ahorcado';
import { MayorMenor } from './pages/mayor-menor/mayor-menor';
import { Chat } from './pages/chat/chat';
import { Preguntados } from './pages/preguntados/preguntados';
import { NoExplotes } from './pages/no-explotes/no-explotes';
import { Resultados } from './pages/resultados/resultados';

import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  { path: '', component: Home },

  { path: 'login', component: Login, canActivate: [noAuthGuard] },
  { path: 'registro', component: Registro, canActivate: [noAuthGuard] },

  { path: 'quien-soy', component: QuienSoy },

  { path: 'ahorcado', component: Ahorcado, canActivate: [authGuard] },
  { path: 'mayor-menor', component: MayorMenor, canActivate: [authGuard] },
  { path: 'preguntados', component: Preguntados, canActivate: [authGuard] },
  { path: 'no-explotes', component: NoExplotes, canActivate: [authGuard] },
  { path: 'chat', component: Chat, canActivate: [authGuard] },
  { path: 'resultados', component: Resultados, canActivate: [authGuard] },

  { path: '**', redirectTo: '' }
];