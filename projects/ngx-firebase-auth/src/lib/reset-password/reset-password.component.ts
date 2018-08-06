import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthRoute } from '../shared';

@Component({
  selector: 'ngx-firebase-auth-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  private _signInMethodsForEmail: string[] = null;

  screen: 'form' | 'success' = 'form';
  formId = 'ngx-firebase-auth-reset-password-';
  submitting = false;
  unhandledError: auth.Error = null;
  emailFc: FormControl;
  fg: FormGroup;


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

  get signInMethodsForEmail(): string[] | null {
    return this._signInMethodsForEmail;
  }
  set signInMethodsForEmail(methods: string[] | null) {
    this._signInMethodsForEmail = methods;
  }

  get emailHasPasswordMethod(): boolean {
    if (! this.signInMethodsForEmail) {
      return false;
    }
    return this.signInMethodsForEmail.indexOf('password') !== -1;
  }

  get emailOAuthMethods(): string[] {
    if (! this.signInMethodsForEmail) {
      return [];
    }
    return this.signInMethodsForEmail.filter(id => 'password' !== id);
  }


  initFg() {
    this.emailFc = new FormControl( this.queryParams.email || '', {asyncValidators: this.validateEmail.bind(this), updateOn: 'blur'});
    this.fg = new FormGroup({
      email: this.emailFc,
    });
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.resetPassword);
    this.initFg();
  }

  validateEmail(fc: FormControl):  Promise<ValidationErrors | null> {
    return new Promise(resolve => {
      const syncError = Validators.required(fc) || Validators.email(fc);
      if (syncError) {
        this.signInMethodsForEmail = [];
        return resolve(syncError);
      }
      const email = fc.value.trim();
      this.auth.fetchSignInMethodsForEmail(email)
        .then(results => {
          this.signInMethodsForEmail = results;
          if (results.length === 0) {
            return resolve({'ngx-firebase-auth/user-not-found' : true});
          }
          if (results.indexOf('password') === -1) {
            return resolve({'ngx-firebase-auth/no-password' : true});
          }
          resolve(null);
        })
        .catch((error) => {
          const formError = {};
          formError[error.code] = true;
          this.signInMethodsForEmail = [];
          resolve(formError);
        });
    });
  }

  submit() {
    this.submitting = true;
    this.unhandledError = null;
    const email = this.emailFc.value.trim();
    return this.auth.sendPasswordResetEmail(email)
      .then(() => {
        this.submitting = false;
        this.screen = 'success';
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        this.unhandledError = error;
      });
  }
}
