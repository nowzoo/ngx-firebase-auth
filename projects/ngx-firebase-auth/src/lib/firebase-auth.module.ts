import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';

import { SignInComponent } from './sign-in/sign-in.component';
import { SignInMethodsFormComponent } from './sign-in/sign-in-methods-form/sign-in-methods-form.component';
import { SignInFormComponent } from './sign-in/sign-in-form/sign-in-form.component';
import { SignUpFormComponent } from './sign-in/sign-up-form/sign-up-form.component';
import { ResetPasswordSendFormComponent } from './sign-in/reset-password-send-form/reset-password-send-form.component';
import { SignInOauthComponent } from './sign-in/sign-in-oauth/sign-in-oauth.component';

import { OobComponent } from './oob/oob.component';
import { OobResetPasswordComponent } from './oob/oob-reset-password/oob-reset-password.component';
import { OobRecoverEmailComponent } from './oob/oob-recover-email/oob-recover-email.component';
import { OobVerifyEmailComponent } from './oob/oob-verify-email/oob-verify-email.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    SignInComponent,
    SignInMethodsFormComponent,
    SignInFormComponent,
    SignUpFormComponent,
    ResetPasswordSendFormComponent,
    SignInOauthComponent,
    OobComponent,
    OobResetPasswordComponent,
    OobRecoverEmailComponent,
    OobVerifyEmailComponent,
  ],
  exports: [
    SignInComponent,
    OobComponent,
  ],
  providers: [
    NgxFirebaseAuthService
  ]
})
export class FirebaseAuthModule { }
