import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';




@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    NgxFirebaseAuthService
  ]
})
export class NgxFirebaseAuthModule { }
