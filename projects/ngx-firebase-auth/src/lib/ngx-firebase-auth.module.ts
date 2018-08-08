import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, Router } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { NgxFormModule } from '@nowzoo/ngx-form';

import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';

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
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AngularFireAuthModule } from 'angularfire2/auth';

const routes: Routes = [
  {path: '', component: AuthComponent, children: [
    {path: 'sign-up', component: SignUpComponent},
    {path: 'sign-in', component: SignInComponent},
    {path: 'sign-out', component: SignOutComponent},
    {path: 'verify-email', component: VerifyEmailComponent},
    {path: 'reset-password', component: ResetPasswordComponent},
    {path: 'oob', children: [
      {path: 'reset-password', component: OobResetPasswordComponent},
      {path: 'verify-email', component: OobVerifyEmailComponent},
      {path: 'recover-email', component: OobRecoverEmailComponent},
      {path: '', component: OobComponent},
    ]},
    {path: '', redirectTo: 'sign-in'},
  ]}
];

@NgModule({
  imports: [
    ReactiveFormsModule,
    AngularFireAuthModule,
    CommonModule,
    NgxFormModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    AlertComponent,
    SignInComponent,
    SignOutComponent,
    SignUpComponent,
    OobComponent,
    OobResetPasswordComponent,
    OobRecoverEmailComponent,
    AuthComponent,
    OobVerifyEmailComponent,
    ResetPasswordComponent,
    VerifyEmailComponent,
  ],
  providers: [
    NgxFirebaseAuthService
  ]
})
export class NgxFirebaseAuthModule { }
