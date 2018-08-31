import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SignInComponent } from './sign-in.component';
import { SignInMethodsFormComponent } from './sign-in-methods-form/sign-in-methods-form.component';
import { SignInFormComponent } from './sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from './sign-up-form/sign-up-form.component';
import { ResetPasswordSendFormComponent } from './reset-password-send-form/reset-password-send-form.component';
import { SignInOauthComponent } from './sign-in-oauth/sign-in-oauth.component';

import { NgxFirebaseAuthModule } from '../ngx-firebase-auth.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgxFirebaseAuthModule
  ],
  declarations: [
    SignInComponent,
    SignInMethodsFormComponent,
    SignInFormComponent,
    SignUpFormComponent,
    ResetPasswordSendFormComponent,
    SignInOauthComponent,
  ],
  exports: [
    SignInComponent,
  ]
})
export class NgxFirebaseAuthSignInModule { }
