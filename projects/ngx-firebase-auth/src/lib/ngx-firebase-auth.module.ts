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
  ],
  providers: [
    NgxFirebaseAuthService
  ]
})
export class NgxFirebaseAuthModule { }
