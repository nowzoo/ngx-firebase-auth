import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxFormModule } from '@nowzoo/ngx-form';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { SignInFormComponent } from './sign-in-form/sign-in-form.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { EmailSignInMethodsFormComponent } from './email-sign-in-methods-form/email-sign-in-methods-form.component';
import { RememberFormComponent } from './remember-form/remember-form.component';
import { SignInOauthFormComponent } from './sign-in-oauth-form/sign-in-oauth-form.component';

@NgModule({
  imports: [
    CommonModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    NgxFormModule
  ],
  declarations: [
    SignInFormComponent,
    SignInComponent,
    EmailSignInMethodsFormComponent,
    RememberFormComponent,
    SignInOauthFormComponent,
  ],
  exports: [
    SignInFormComponent,
    SignInComponent,
    EmailSignInMethodsFormComponent,
    RememberFormComponent,
    SignInOauthFormComponent,
  ],

})
export class SharedModule { }
