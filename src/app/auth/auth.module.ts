import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgxFirebaseAuthModule } from '@nowzoo/ngx-firebase-auth';

const routes: Routes = [
  {path: '', component: IndexComponent, loadChildren: () => NgxFirebaseAuthModule}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [IndexComponent]
})
export class AuthModule { }
