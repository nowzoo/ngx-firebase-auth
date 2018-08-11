import { Injectable, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FormControl, Validators, ValidationErrors } from '@angular/forms';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { ActivatedRoute, ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import {
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS,
  INgxFirebaseAuthOptions,
  INgxFirebaseActionCodeSuccess
} from './shared';

@Injectable({
  providedIn: 'root'
})
export class NgxFirebaseAuthService {

  private _cred$: Subject<auth.UserCredential> = new Subject();
  private _route$: Subject<NgxFirebaseAuthRoute> = new Subject();

  private _actionCodeSuccess$: Subject<INgxFirebaseActionCodeSuccess> = new Subject();
  private _baseRouteSlugs: string[] = [];

  constructor(
    @Inject(NGX_FIREBASE_AUTH_OPTIONS) private _options: INgxFirebaseAuthOptions,
    private _afAuth: AngularFireAuth
  ) {
    console.log('constructed');
  }

  get options(): INgxFirebaseAuthOptions {
    return this._options;
  }

  get passwordMethodEnabled(): boolean {
    return this.options.signInMethods.indexOf('password') !== -1;
  }

  get oAuthMethodsEnabled(): string[] {
    return this.options.signInMethods.filter(id => 'password' !== id);
  }

  get authState(): Observable<User> {
    return this._afAuth.authState;
  }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get route(): Observable<NgxFirebaseAuthRoute> {
    return this._route$.asObservable();
  }
  setRoute(route: NgxFirebaseAuthRoute) {
    this._route$.next(route);
  }


  get baseRouteSlugs(): string[] {
    return this._baseRouteSlugs.map(s => s);
  }


  get signInSuccess(): Observable<auth.UserCredential> {
    return this._cred$.asObservable();
  }
  pushSignInSuccess(cred: auth.UserCredential) {
    this._cred$.next(cred);
  }

  pushActionCodeSuccess(info: auth.ActionCodeInfo): Promise<INgxFirebaseActionCodeSuccess> {
    return new Promise((resolve) => {
      this.authState.pipe(take(1)).subscribe(user => {
        const success: INgxFirebaseActionCodeSuccess = {
          user: user,
          actionCodeInfo: info
        };
        this._actionCodeSuccess$.next(success);
        resolve(success);
      });
    });

  }


  setBaseRoute(route: ActivatedRoute) {
    let currentRoute: ActivatedRouteSnapshot = route.snapshot;
    const slugs = [];
    while (currentRoute) {
      slugs.unshift(...currentRoute.url.map((seg: UrlSegment) => seg.path));
      currentRoute = currentRoute.parent;
    }
    slugs.unshift('/');
    this._baseRouteSlugs = slugs;
  }


  getSignInRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['sign-in']);
  }

  getSignInOAuthRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['sign-in', 'oauth']);
  }

  getSignUpRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['sign-up']);
  }

  getResetPasswordRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['reset-password']);
  }

  getSignOutRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['sign-out']);
  }

  getVerifyEmailRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['verify-email']);
  }

  getOobResetPasswordRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['oob', 'reset-password']);
  }
  getOobRecoverEmailRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['oob', 'recover-email']);
  }
  getOobVerifyEmailRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['oob', 'verify-email']);
  }

  get emailHasNoAccountValidator() {
    return this.validateEmailHasNoAccount.bind(this);
  }

  validateEmailHasNoAccount(fc: FormControl): Promise<ValidationErrors | null> {
    return new Promise(resolve => {
      const syncError = Validators.required(fc) || Validators.email(fc);
      if (syncError) {
        return resolve(syncError);
      }
      const email = fc.value.trim();
      this.auth.fetchSignInMethodsForEmail(email)
        .then(results => {
          if (results.length !== 0) {
            return resolve({'ngx-firebase-auth/email-already-in-use' : results});
          }
          resolve(null);
        })
        .catch((error) => {
          const formError = {};
          formError[error.code] = true;
          resolve(formError);
        });
    });
  }
  get emailHasPasswordValidator() {
    return this.validateEmailHasPassword.bind(this);
  }
  validateEmailHasPassword(fc: FormControl): Promise<ValidationErrors | null> {
    return new Promise(resolve => {
      const syncError = Validators.required(fc) || Validators.email(fc);
      if (syncError) {
        return resolve(syncError);
      }
      const email = fc.value.trim();
      this.auth.fetchSignInMethodsForEmail(email)
        .then(results => {
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
          resolve(formError);
        });
    });
  }

  getOAuthProvider(id: string): auth.AuthProvider {
    let provider;
    if (this.options.oAuthProviderFactory) {
      provider = this.options.oAuthProviderFactory(id);
      if (provider) {
        return provider;
      }
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


}
