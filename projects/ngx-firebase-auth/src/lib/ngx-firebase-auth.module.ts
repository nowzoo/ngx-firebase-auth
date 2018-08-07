import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, Router } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { NgxFormModule } from '@nowzoo/ngx-form';

import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';

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
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { OauthSignInComponent } from './oauth-sign-in/oauth-sign-in.component';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { NGX_FIREBASE_AUTH_OPTIONS, INgxFirebaseAuthOptions } from './shared';

const routes: Routes = [
  {path: '', component: AuthComponent, children: [
    {path: 'sign-up', component: SignUpComponent},
    {path: 'sign-in', children: [
      {path: 'oauth', component: OauthSignInComponent},
      {path: '', component: SignInComponent},
    ]},
    {path: 'sign-out', component: SignOutComponent},
    {path: 'verify-email', component: VerifyEmailComponent},
    {path: 'reset-password', component: ResetPasswordComponent},
    {path: 'oob', children: [
      {path: 'reset-password', component: OobResetPasswordComponent},
      {path: 'verify-email', component: OobVerifyEmailComponent},
      {path: 'recover-email', component: OobRecoverEmailComponent},
      {path: '', component: OobComponent},
    ]},
    {path: '', component: IndexComponent},
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
    IndexComponent,
    SignInComponent,
    OauthSignInComponent,
    SignOutComponent,
    SignUpComponent,
    VerifyEmailComponent,
    OobComponent,
    OobResetPasswordComponent,
    AlertComponent,
    OobRecoverEmailComponent,
    AuthComponent,
    OobVerifyEmailComponent,
    ResetPasswordComponent,
  ],
  providers: [
    NgxFirebaseAuthService
  ]
})
export class NgxFirebaseAuthModule { }
