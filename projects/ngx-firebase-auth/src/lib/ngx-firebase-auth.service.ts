import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FormControl, Validators, ValidationErrors } from '@angular/forms';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { ActivatedRoute, ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import {
  NgxFirebaseAuthRoute,
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
    private _afAuth: AngularFireAuth
  ) { }

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

}
