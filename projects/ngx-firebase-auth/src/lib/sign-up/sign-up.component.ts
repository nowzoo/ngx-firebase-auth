import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import {
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS,
  INgxFirebaseAuthOptions
} from '../shared';
@Component({
  selector: 'ngx-firebase-auth-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  private _signInMethodsForEmail: string[] = null;

  showInvalid = NgxFormUtils.showInvalid;
  formId = 'ngx-firebase-auth-sign-up-';
  submitting = false;
  unhandledError: auth.Error = null;
  nameFc: FormControl;
  emailFc: FormControl;
  passwordFc: FormControl;
  rememberFc: FormControl;
  fg: FormGroup;

  constructor(
    @Inject(NGX_FIREBASE_AUTH_OPTIONS) private _options: INgxFirebaseAuthOptions,
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  get options(): INgxFirebaseAuthOptions {
    return this._options;
  }

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
    this.nameFc = new FormControl('', {validators: [Validators.required, NgxFormValidators.requiredString]});
    this.emailFc = new FormControl( this.queryParams.email || '', {asyncValidators: this.validateEmail.bind(this), updateOn: 'blur'});
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(true);
    this.fg = new FormGroup({
      name: this.nameFc, email: this.emailFc, password: this.passwordFc, remember: this.rememberFc
    });
  }


  submit() {
    this.submitting = true;
    this.unhandledError = null;
    const name = this.nameFc.value.trim();
    const email = this.emailFc.value.trim();
    const password = this.passwordFc.value;
    const persistence = this.rememberFc.value === false ? auth.Auth.Persistence.SESSION : auth.Auth.Persistence.LOCAL;
    let cred: auth.UserCredential;
    return this.auth.createUserWithEmailAndPassword(email, password)
      .then((result: auth.UserCredential) => {
        cred = result;
        return cred.user.updateProfile({displayName: name, photoURL: null});
      })
      .then(() => {
        return cred.user.reload();
      })
      .then(() => {
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
          case 'auth/weak-password':
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
          if (results.length > 0) {
            return resolve({'ngx-firebase-auth/email-already-in-use' : true});
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
