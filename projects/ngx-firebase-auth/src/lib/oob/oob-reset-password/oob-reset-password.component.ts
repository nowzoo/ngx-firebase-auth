import { Component, OnInit, Input } from '@angular/core';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth } from 'firebase/app';
import { NgxFormUtils } from '@nowzoo/ngx-form';

import {
  INgxFirebaseAuthOobResult, NgxFirebaseAuthRoute
} from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-reset-password',
  templateUrl: './oob-reset-password.component.html',
  styleUrls: ['./oob-reset-password.component.css']
})
export class OobResetPasswordComponent implements OnInit {

  @Input() result: INgxFirebaseAuthOobResult;

  formId: string;
  submitting = false;
  emailFc: FormControl;
  passwordFc: FormControl;
  fg: FormGroup;
  error: auth.Error = null;
  screen: 'form' | 'error' | 'success';
  constructor(
    private _authService: NgxFirebaseAuthService
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.resetPasswordCode);
    this.formId = NgxFirebaseAuthService.uniqueId();
    this.emailFc = new FormControl(this.result.email);
    this.emailFc.disable();
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.fg = new FormGroup({
      email: this.emailFc,
      password: this.passwordFc
    });
    if (this.result.error) {
      this.error = this.result.error;
      this.screen = 'error';
    } else {
      this.screen = 'form';
    }
  }

  submit() {

    this.submitting = true;
    const password = this.passwordFc.value;
    this.authService.confirmPasswordReset(this.result.code, this.result.email, password)
      .then(() => {
        this.screen = 'success';
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/weak-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.error = error;
            this.screen = 'error';
            break;
        }

      });
  }

}
