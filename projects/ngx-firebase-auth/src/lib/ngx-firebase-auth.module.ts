import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxFormModule } from '@nowzoo/ngx-form';
import { IndexComponent } from './index/index.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { OobComponent } from './oob/oob.component';
import { OobResetPasswordComponent } from './oob-reset-password/oob-reset-password.component';
import { AlertComponent } from './alert/alert.component';
import { OobRecoverEmailComponent } from './oob-recover-email/oob-recover-email.component';
import { AuthComponent } from './auth/auth.component';
import { OobVerifyEmailComponent } from './oob-verify-email/oob-verify-email.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgxFormModule
  ],
  declarations: [
    IndexComponent,
    SignInComponent,
    SignOutComponent,
    SignUpComponent,
    VerifyEmailComponent,
    OobComponent,
    OobResetPasswordComponent,
    AlertComponent,
    OobRecoverEmailComponent,
    AuthComponent,
    OobVerifyEmailComponent,
  ],
  providers: [
    NgxFirebaseAuthService
  ]
})
export class NgxFirebaseAuthModule { }
