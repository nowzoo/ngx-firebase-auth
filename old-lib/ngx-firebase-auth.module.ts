import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';
import { RememberFormComponent } from './remember-form/remember-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxFormModule } from '@nowzoo/ngx-form';
import { SignInComponent } from './sign-in/sign-in.component';
import { EmailSignInFormComponent } from './sign-in/email-sign-in-form/email-sign-in-form.component';
import { EmailSignUpFormComponent } from './sign-in/email-sign-up-form/email-sign-up-form.component';
import { OobComponent } from './oob/oob.component';
import { OobResetPasswordComponent } from './oob/oob-reset-password/oob-reset-password.component';
import { OobVerifyEmailComponent } from './oob/oob-verify-email/oob-verify-email.component';
import { OobRecoverEmailComponent } from './oob/oob-recover-email/oob-recover-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { SignUpComponent } from './sign-up/sign-up.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgxFormModule
  ],
  declarations: [
    RememberFormComponent,
    SignInComponent,
    EmailSignInFormComponent,
    EmailSignUpFormComponent,
    OobComponent,
    OobResetPasswordComponent,
    OobVerifyEmailComponent,
    OobRecoverEmailComponent,
    ResetPasswordComponent,
    VerifyEmailComponent,
    SignOutComponent,
    SignUpComponent,
  ],
  providers: [
    NgxFirebaseAuthService
  ]
})
export class NgxFirebaseAuthModule { }
