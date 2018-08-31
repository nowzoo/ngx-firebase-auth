import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgxFirebaseAuthOobModule } from '@nowzoo/ngx-firebase-auth';
import { RouteComponent } from './route/route.component';

const routes: Routes = [
  {path: '', component: RouteComponent}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxFirebaseAuthOobModule
  ],
  declarations: [RouteComponent]
})
export class OobModule { }
