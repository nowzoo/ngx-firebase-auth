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
  selector: 'ngx-firebase-auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  private _signInMethodsForEmail: string[] = null;

  showInvalid = NgxFormUtils.showInvalid;
  formId = 'ngx-firebase-auth-sign-in-';
  submitting = false;
  unhandledError: auth.Error = null;
  emailFc: FormControl;
  passwordFc: FormControl;
  rememberFc: FormControl;
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



  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.signUp);
    this.initFg();
  }
  initFg() {
    this.emailFc = new FormControl( this.queryParams.email || '', {asyncValidators: this.validateEmail.bind(this), updateOn: 'blur'});
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(true);
    this.fg = new FormGroup({
       email: this.emailFc, password: this.passwordFc, remember: this.rememberFc
    });
  }


  submit() {
    this.submitting = true;
    this.unhandledError = null;
    const email = this.emailFc.value.trim();
    const password = this.passwordFc.value;
    const persistence = this.rememberFc.value === false ? auth.Auth.Persistence.SESSION : auth.Auth.Persistence.LOCAL;
    let cred: auth.UserCredential;
    return this.auth.signInWithEmailAndPassword(email, password)
      .then((result: auth.UserCredential) => {
        cred = result;
        return this.auth.setPersistence(persistence);
      })
      .then(() => {
        this.authService.pushCred(cred);
        if (! this.authService.redirectCancelled) {
          this.router.navigate(['../'], {relativeTo: this.route});
        }
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/wrong-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.unhandledError = error;
            break;
        }
      });
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
}
