import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { OobComponent } from './oob.component';
import { OobResetPasswordComponent } from './oob-reset-password/oob-reset-password.component';
import { OobRecoverEmailComponent } from './oob-recover-email/oob-recover-email.component';
import { OobVerifyEmailComponent } from './oob-verify-email/oob-verify-email.component';

import { NgxFirebaseAuthModule } from '../ngx-firebase-auth.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgxFirebaseAuthModule
  ],
  declarations: [
    OobComponent,
    OobRecoverEmailComponent,
    OobResetPasswordComponent,
    OobVerifyEmailComponent
  ],
  exports: [
    OobComponent,
  ]
})
export class NgxFirebaseAuthOobModule { }
