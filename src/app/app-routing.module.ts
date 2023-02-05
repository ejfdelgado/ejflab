import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['customers']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
    //canActivate: [AuthGuard],
    //data: { authGuardPipe: redirectLoggedInToHome },
  },
  {
    path: 'customers',
    loadChildren: () =>
      import('./customers/customers.module').then((m) => m.CustomersModule),
    //canActivate: [AuthGuard],
    //data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'customers/:id',
    loadChildren: () =>
      import('./customers/customers.module').then((m) => m.CustomersModule),
    //canActivate: [AuthGuard],
    //data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'callgame',
    loadChildren: () =>
      import('./callgame/callgame.module').then((m) => m.CallgameModule),
  },
  { path: 'calendar', loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule) },
  { path: 'cv', loadChildren: () => import('./cv/cv.module').then(m => m.CvModule) },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
