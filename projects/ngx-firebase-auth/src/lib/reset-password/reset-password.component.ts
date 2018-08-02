import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { take } from 'rxjs/operators';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFirebaseAuthRoute } from '../shared';
import { auth, User } from 'firebase/app';

@Component({
  selector: 'ngx-firebase-auth-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  formId: string;
  error: auth.Error = null;
  screen: 'form' | 'error' | 'success' = 'form';
  fg: FormGroup;
  emailFc: FormControl;
  submitting = false;

  constructor(
    private _route: ActivatedRoute,
    private _authService: NgxFirebaseAuthService
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }

  ngOnInit() {
    this.formId = NgxFirebaseAuthService.uniqueId();
    this.authService.setRoute(NgxFirebaseAuthRoute.resetPasswordSend);
    this.emailFc = new FormControl(this.queryParams.email || '', {validators: [Validators.required, Validators.email]});
    this.fg = new FormGroup({email: this.emailFc});
  }

  submit() {
    this.submitting = true;
    this.authService.sendPasswordResetEmail(this.emailFc.value.trim())
      .then(() => {
        this.screen = 'success';
        this.submitting = false;
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/user-not-found':
            NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
            break;
          default:
            this.error = error;
            this.screen = 'error';
            break;
        }
      });
  }
}
