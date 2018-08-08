import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthRoute } from '../shared';

@Component({
  selector: 'ngx-firebase-auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  screen: 'form' | 'success' | 'error' = 'form';
  showInvalid = NgxFormUtils.showInvalid;
  formId = 'ngx-firebase-auth-sign-in-';
  submitting = false;
  unhandledError: auth.Error = null;
  cred: auth.UserCredential = null;
  emailFc: FormControl;
  passwordFc: FormControl;
  rememberFc: FormControl;
  fg: FormGroup;

  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  get route(): ActivatedRoute {
    return this._route;
  }

  get queryParams(): {[key: string]: any} {
    return this.route.snapshot.queryParams;
  }





  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.signUp);
    this.initFg();
    console.log('SignInComponent on init');
  }
  initFg() {
    this.emailFc = new FormControl(
      this.queryParams.email || '',
      {asyncValidators: this.authService.emailHasPasswordValidator, updateOn: 'blur'}
    );
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(true);
    this.fg = new FormGroup({
       email: this.emailFc, password: this.passwordFc, remember: this.rememberFc
    });
  }

  reset() {
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
    const persistence = this.rememberFc.value === false ? auth.Auth.Persistence.SESSION : auth.Auth.Persistence.LOCAL;
    return this.auth.signInWithEmailAndPassword(email, password)
      .then((result: auth.UserCredential) => {
        this.cred = result;
        return this.auth.setPersistence(persistence);
      })
      .then(() => {
        this.authService.pushSignInSuccess(this.cred);
        this.screen = 'success';
        this.submitting = false;
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        switch (error.code) {
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
