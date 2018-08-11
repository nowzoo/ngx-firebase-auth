import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { NgxFormModule } from '@nowzoo/ngx-form';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignInScreenComponent } from './sign-in/sign-in-screen/sign-in-screen.component';
import { SignUpScreenComponent } from './sign-in/sign-up-screen/sign-up-screen.component';
import { ResetPasswordScreenComponent } from './sign-in/reset-password-screen/reset-password-screen.component';





@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgxFormModule,
    RouterModule
  ],
  declarations: [

  SignInComponent,

  SignInScreenComponent,

  SignUpScreenComponent,

  ResetPasswordScreenComponent],
  exports: [SignInComponent]
})
export class NgxFirebaseAuthModule { }
