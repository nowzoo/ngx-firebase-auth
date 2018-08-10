import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';

enum Screens {
  wait,
  signInForm,
  signInError,
  signInSuccess,
  resetPasswordForm,
  resetPasswordError,
  resetPasswordSuccess,
  signOut
}
@Component({
  selector: 'ngx-firebase-auth-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.css']
})
export class SignInFormComponent implements OnInit {

  message: string = null;
  screen: Screens = Screens.wait;
  screens = Screens;
  showInvalid = NgxFormUtils.showInvalid;
  submitting = false;
  unhandledError: auth.Error = null;
  user: User = null;
  formId = 'ngx-firebase-auth-sign-in-form-';
  emailFc: FormControl;
  passwordFc: FormControl;
  nameFc: FormControl;
  rememberFc: FormControl;
  fg: FormGroup;
  methodsForEmail: string[] = [];
  methodsFetched = false;
  emailFetchSubscription: Subscription = null;

  @Input() email = '';
  @Input() oAuthProviderFactory: (id: string) => auth.AuthProvider = null;
  @Input() oAuthMethods: string[] = [];
  @Input() oAuthPopupEnabled = false;
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();

  constructor(
    private _afAuth: AngularFireAuth,
    private _route: ActivatedRoute,
    private _router: Router,
    private _ngZone: NgZone
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authState(): Observable<User> {
    return this._afAuth.authState;
  }

  get router(): Router {
    return this._router;
  }

  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }

  get accountExists(): boolean {
    return this.methodsFetched && this.methodsForEmail.length > 0;
  }

  get accountHasPassword(): boolean {
    return this.methodsForEmail.indexOf('password') !== -1;
  }

  get accountOAuthMethods(): string[] {
    return this.methodsForEmail.filter(id => 'password' !== id);
  }

  fetchMethodsForEmail() {
    this.methodsFetched = false;
    this.methodsForEmail = [];
    this._ngZone.runOutsideAngular(() => {
      if (this.emailFc.status !== 'VALID') {
        this._ngZone.run(() => {});
        return;
      }
      this.auth.fetchSignInMethodsForEmail(this.emailFc.value.trim())
        .then((results: string[]) => {
          this._ngZone.run(() => {
            this.methodsFetched = true;
            this.methodsForEmail = results;
            if (results.length === 0) {
              this.fg.setControl('name', this.nameFc);
              if (this.screen === Screens.resetPasswordForm) {
                NgxFormUtils.setErrorUntilChanged(this.emailFc, 'auth/user-not-found');
              }
            } else {
              if (this.screen === Screens.resetPasswordForm) {
                if (results.indexOf('password') === -1) {
                  NgxFormUtils.setErrorUntilChanged(this.emailFc, 'auth/no-password');
                }
              }
              this.fg.removeControl('name');
              if (results.indexOf('password') === -1) {
                this.passwordFc.disable();
              } else {
                this.passwordFc.enable();
              }
            }
          });
        })
        .catch((error: auth.Error) => {
          this._ngZone.run(() => {
            NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
          });
        });
    });




  }

  getOAuthProvider(id: string): auth.AuthProvider {
    if (this.oAuthProviderFactory) {
      return this.oAuthProviderFactory(id);
    }
    switch (id) {
      case 'twitter.com': return new auth.TwitterAuthProvider();
      case 'facebook.com': return new auth.FacebookAuthProvider();
      case 'github.com': return new auth.GithubAuthProvider();
      case 'google.com': return new auth.GoogleAuthProvider();
    }
    throw new Error(`Could not create a provider for "${id}".`);
  }

  getOAuthProviderName(id: string) {
    switch (id) {
      case 'twitter.com': return 'Twitter';
      case 'facebook.com': return 'Facebook';
      case 'github.com': return 'GitHub';
      case 'google.com': return 'Google';
      default: return id;
    }
  }
  getOAuthProviderIconClass(id: string) {
    switch (id) {
      case 'twitter.com': return 'fab fa-fw fa-twitter';
      case 'facebook.com': return 'fab fa-fw fa-facebook';
      case 'github.com': return 'fab fa-fw fa-github';
      case 'google.com': return 'fab fa-fw fa-google';
      default: return 'fas fa-fw fa-sign-in-alt';
    }
  }

  ngOnInit() {
    this.emailFc = new FormControl(
      this.email, {validators: [Validators.required, Validators.email], updateOn: 'blur'}
    );
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(true);
    this.nameFc = new FormControl('', {validators:  [Validators.required, NgxFormValidators.requiredString]});
    this.checkOAuthRedirect()
      .then((handled: boolean) => {
        if (handled) {
          return;
        }
        if (this.queryParams.action === 'signOut') {
          this.showSignOut();
          return;
        }
        if (this.queryParams.action === 'resetPassword') {
          this.showResetPasswordForm();
          return;
        }
        this.authState.pipe(take(1)).subscribe((user: User) => {
          if (user) {
            this.showSignOut();
          } else {
            this.showSignInForm();
          }
        });
      });
  }

  onEmailFcFocused() {
    this.methodsForEmail = [];
    this.methodsFetched = false;
    this.fg.removeControl('name');
  }





  showSignOut() {
    this.screen = Screens.signOut;
    this.auth.signOut()
      .then(() => {
        this.message = 'Thanks. You’re signed out.';
        this.showSignInForm();
      });
  }


  checkOAuthRedirect(): Promise<boolean> {
    return new Promise(resolve => {
      this.auth.getRedirectResult()
        .then((cred: auth.UserCredential) => {
          if (cred.user) {
            this.showSignInSuccess(cred);
            return resolve(true);
          }
          resolve(false);
        })
        .catch((error: auth.Error) => {
          this.showSignInError(error);
        });
    });

  }


  oAuthSignIn(providerId: string) {
    this.submitting = true;
    this.unhandledError = null;
    const provider = this.getOAuthProvider(providerId);
    if (this.oAuthPopupEnabled) {
      this.auth.signInWithPopup(provider)
        .then((cred: auth.UserCredential) => {
          this.submitting = false;
          this.showSignInSuccess(cred);
        })
        .catch((error: auth.Error) => {
          this.submitting = false;
          this.showSignInError(error);
        });
    } else {
      this.auth.signInWithRedirect(provider)
        .catch((error: auth.Error) => {
          this.submitting = false;
          this.showSignInError(error);
        });
    }
  }


  signInSubmit() {
    this.submitting = true;
    this.unhandledError = null;
    const email = this.emailFc.value.trim();
    const password = this.passwordFc.value;
    const name = this.nameFc.value.trim();

    this.auth.fetchSignInMethodsForEmail(email)
      .then((methods: string[]) => {
        if (methods.length > 0 && methods.indexOf('password') === -1) {
          const err = {code: 'auth/no-password', message: `The accont for ${email} does not have a password.`};
          return Promise.reject(err);
        }
        if (this.accountHasPassword) {
          return this.auth.signInWithEmailAndPassword(email, password);
        }
        let cred: auth.UserCredential;
        return this.auth.createUserWithEmailAndPassword(this.emailFc.value.trim(), this.passwordFc.value)
          .then((result: auth.UserCredential) => {
            cred = result;
            return cred.user.updateProfile({displayName: this.nameFc.value.trim(), photoURL: null});
          })
          .then(() => {
            return cred.user.reload();
          })
          .then(() => {
            return cred;
          });

      })
      .then((cred: auth.UserCredential) => {
        this.submitting = false;
        this.showSignInSuccess(cred);
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/weak-password':
          case 'auth/wrong-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.showSignInError(error);
            break;
        }
      });

  }

  resetPasswordSubmit() {
    this.submitting = true;
    this.unhandledError = null;
    this.auth.sendPasswordResetEmail(this.emailFc.value.trim())
      .then(() => {
        this.showResetPasswordSuccess();
      })
      .catch((error: auth.Error) => {
        this.showResetPasswordError(error);
      });
  }

  showSignInForm() {
    if (this.emailFetchSubscription) {
      this.emailFetchSubscription.unsubscribe();
    }
    this.methodsForEmail = [];
    this.methodsFetched = false;
    this.submitting = false;
    this.unhandledError = null;
    this.fg = new FormGroup({
      email: this.emailFc,
      password: this.passwordFc,
      remember: this.rememberFc
    });
    this.emailFetchSubscription = this.emailFc.valueChanges.subscribe(() => this.fetchMethodsForEmail());
    this.fetchMethodsForEmail();
    this.screen = Screens.signInForm;
  }
  showSignInError(error: auth.Error) {
    this.unhandledError = error;
    this.screen = Screens.signInError;
  }
  showSignInSuccess(cred: auth.UserCredential) {
    this.user = cred.user;
    this.screen = Screens.signInSuccess;
    this.success.emit(cred);
  }

  showResetPasswordForm() {
    this.submitting = false;
    this.unhandledError = null;
    this.fg = new FormGroup({
      email: this.emailFc
    });
  }
  showResetPasswordError(error: auth.Error) {
    this.unhandledError = error;
    this.screen = Screens.resetPasswordError;
  }
  showResetPasswordSuccess() {
    this.screen = Screens.resetPasswordSuccess;
  }


}
