import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth } from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthRoute } from '../shared';

@Component({
  selector: 'ngx-firebase-auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  screen:  'form' | 'success' | 'error' = 'form';
  showInvalid = NgxFormUtils.showInvalid;
  formId = 'ngx-firebase-auth-sign-in-';
  submitting = false;
  unhandledError: auth.Error = null;
  cred: auth.UserCredential = null;
  emailFc: FormControl;
  passwordFc: FormControl;
  fg: FormGroup;

  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
  ) { }



  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.signUp);
    this.emailFc = new FormControl(
      this.queryParams.email || '',
      {validators: [Validators.required, Validators.email]}
    );
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.fg = new FormGroup({
      email: this.emailFc, password: this.passwordFc
    });
  }


  reset(email?: string) {
    this.emailFc.setValue(email || '');
    this.cred = null;
    this.unhandledError = null;
    this.submitting = false;
    this.screen = 'form';
  }


  submit() {
    this.submitting = true;
    this.unhandledError = null;
    const email = this.emailFc.value.trim();
    const password = this.passwordFc.value;


    this.auth.signInWithEmailAndPassword(email, password)
      .then((result: auth.UserCredential) => {
        this.cred = result;
        this.authService.pushSignInSuccess(this.cred);
        this.screen = 'success';
        this.submitting = false;
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        this.passwordFc.markAsTouched();
        this.emailFc.markAsTouched();
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/invalid-email':
          case 'auth/user-disabled':
            NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
            break;
          case 'auth/wrong-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.unhandledError = error;
            this.screen = 'error';
            break;
        }
      });
  }
}
