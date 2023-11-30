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
    loadChildren: () =>
      import('./views/home/home.module').then((m) => m.HomeModule),
  },
];

/*
IMPORTANTE: Cuando agregue un módulo acá, debe modificar tsconfig.app.json
*/
const PAGINAS = [
  { id: 'cv', module: 'CvModule' },
  { id: 'calendar', module: 'CalendarModule' },
  { id: 'callgame', module: 'CallgameModule' },
  { id: 'tale', module: 'TaleModule' },
  { id: 'humanpose', module: 'HumanposeModule' },
  { id: 'projection', module: 'ProjectionModule' },
  { id: 'decisiontree', module: 'DecisiontreeModule' },
  { id: 'uechat', module: 'UechatModule' },
];

for (let i = 0; i < PAGINAS.length; i++) {
  const actual = PAGINAS[i];
  routes.push({
    path: `${actual.id}`,
    //canActivate: [AuthGuard],
    //data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () =>
      import(`./views/${actual.id}/${actual.id}.module`).then(
        (m) => m[actual.module]
      ),
  });
  routes.push({
    path: `${actual.id}/:id`,
    //canActivate: [AuthGuard],
    //data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () =>
      import(`./views/${actual.id}/${actual.id}.module`).then(
        (m) => m[actual.module]
      ),
  });
}

routes.push({
  path: '**',
  redirectTo: '',
  pathMatch: 'full',
});

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
