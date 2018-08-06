import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import {
  NgxFirebaseAuthRoute
} from '../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-reset-password',
  templateUrl: './oob-reset-password.component.html',
  styleUrls: ['./oob-reset-password.component.css']
})
export class OobResetPasswordComponent implements OnInit {

  screen: 'wait' | 'form' | 'error' = 'wait';
  error: auth.Error = null;
  cred: auth.UserCredential;
  actionCodeInfo: auth.ActionCodeInfo = null;


  showInvalid = NgxFormUtils.showInvalid;
  formId = 'ngx-firebase-auth-oob-reset-password-';
  emailFc: FormControl;
  passwordFc: FormControl;
  rememberFc: FormControl;
  fg: FormGroup;
  submitting = false;


  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router
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

  get router(): Router {
    return this._router;
  }

  initFg() {
    this.emailFc = new FormControl('');
    this.emailFc.disable();
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(true);
    this.fg = new FormGroup({
      email: this.emailFc,
      password: this.passwordFc,
      remember: this.rememberFc
    });
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.oobResetPassword);
    this.initFg();
    const oobCode = this.queryParams.oobCode;
    this.auth.checkActionCode(oobCode)
      .then((result: auth.ActionCodeInfo) => {
        this.actionCodeInfo = result;
        this.emailFc.setValue(result.data.email);
        this.screen = 'form';
      })
      .catch((error: auth.Error) => {
        this.error = error;
        this.screen = 'error';
      });
  }

  submit() {
    this.submitting = true;
    this.error = null;
    const oobCode = this.queryParams.oobCode;
    const email = this.emailFc.value;
    const password = this.passwordFc.value;
    const persistence = this.rememberFc.value === false ? auth.Auth.Persistence.SESSION : auth.Auth.Persistence.LOCAL;
    this.auth.confirmPasswordReset(oobCode, password)
      .then(() => {
        return this.auth.signInWithEmailAndPassword(email, password);
      })
      .then((result: auth.UserCredential) => {
        this.cred = result;
        return this.auth.setPersistence(persistence);
      })
      .then(() => {
        return this.authService.pushActionCodeSuccess(this.actionCodeInfo);
      })
      .then(() => {
        this.screen = null;
        if (! this.authService.redirectCancelled) {
          this.authService.successMessage = `Your new password has been saved and you are signed in.`;
          this.router.navigate(this.authService.getIndexRouterLink());
        }
      })
      .catch((error: auth.Error) => {
        switch (error.code) {
          case 'auth/weak-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.error = error;
            this.screen = 'error';
            break;
        }
        this.submitting = false;
      });
  }

}
