import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgxFirebaseAuthSignInModule } from '@nowzoo/ngx-firebase-auth';

import { RouteComponent } from './route/route.component';

const routes: Routes = [
  {path: '', component: RouteComponent}
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxFirebaseAuthSignInModule
  ],
  declarations: [RouteComponent]
})
export class SignInModule { }
