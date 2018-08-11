import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgxFirebaseAuthModule } from '@nowzoo/ngx-firebase-auth';
import { FirebaseUiComponent } from './firebase-ui/firebase-ui.component';

const routes: Routes = [
  {path: '', component: IndexComponent}
];


@NgModule({
  imports: [
    CommonModule,
    NgxFirebaseAuthModule,
    RouterModule.forChild(routes)
  ],
  declarations: [IndexComponent, FirebaseUiComponent],
  providers: [

  ]
})
export class AuthModule { }
