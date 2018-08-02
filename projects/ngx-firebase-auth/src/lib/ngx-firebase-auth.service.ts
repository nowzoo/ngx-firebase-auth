import { Injectable, Inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { take } from 'rxjs/operators';
import { NgxRouteUtils } from '@nowzoo/ngx-route-utils';

import {
  NgxFirebaseAuthRoute,
  NgxFirebaseAuthOAuthMethod,
  NGX_FIREBASE_AUTH_OPTIONS,
  INgxFirebaseAuthOptions,
  INgxFirebaseAuthOobResult
} from './shared';
@Injectable({
  providedIn: 'root'
})
export class NgxFirebaseAuthService {
  static persistenceStorageKey = 'ngx-firebase-auth-persistence';
  static idCtr = 0;

  private _onAuth: Subject<auth.UserCredential> = new Subject();
  private _authRedirectCancelled = false;
  private _routeShown$: Subject<NgxFirebaseAuthRoute> = new Subject();
  private _baseRoute = '/';
  private _oAuthMethod = NgxFirebaseAuthOAuthMethod.redirect;
  private _internalRedirectMessage: string = null;

  static uniqueId(): string {
    return `ngx-firebase-auth-${++NgxFirebaseAuthService.idCtr}`;
  }


  constructor(
    @Inject(NGX_FIREBASE_AUTH_OPTIONS) private _options: INgxFirebaseAuthOptions,
    private _afAuth: AngularFireAuth,
    private _router: Router
  ) { }

  get options(): INgxFirebaseAuthOptions {
    return this._options;
  }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }


  get authState(): Observable<User> {
    return this._afAuth.authState;
  }

  get router(): Router {
    return this._router;
  }

  get authRedirectCancelled(): boolean {
    return this._authRedirectCancelled;
  }

  get onAuth(): Observable<auth.UserCredential> {
    return this._onAuth.asObservable();
  }

  get baseRoute(): string {
    return this._baseRoute;
  }

  get oAuthMethod(): NgxFirebaseAuthOAuthMethod {
    return this._oAuthMethod;
  }

  get routeShown(): Observable<NgxFirebaseAuthRoute> {
    return this._routeShown$.asObservable();
  }

  get internalRedirectMessage(): string {
    return this._internalRedirectMessage;
  }



  setRoute(route: NgxFirebaseAuthRoute) {
    this._routeShown$.next(route);
  }

  getRouterLink(path?: string|string[]) {
    if (! path) {
      path = [];
    } else {
      if (typeof path === 'string') {
        path = [path];
      }
    }
    path.unshift(this.baseRoute);
    return path;
  }

  internalRedirect(path?: string|string[], message?: string) {
    this._internalRedirectMessage = message || null;
    this.router.navigate(this.getRouterLink(path));
  }
  initBaseRoute(route: ActivatedRoute) {
    this._baseRoute = NgxRouteUtils.urlFromRoute(route);
  }

  setOAuthMethod(method: NgxFirebaseAuthOAuthMethod) {
    this._oAuthMethod = method;
  }

  createUserWithPassword(email: string, password: string, name: string): Promise<auth.UserCredential> {
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
        return this.handleAuthSuccess(cred);
      });
  }

  signInWithPassword(email: string, password: string): Promise<auth.UserCredential> {
    return this.auth.signInWithEmailAndPassword(email, password)
      .then((cred: auth.UserCredential) => {
        return this.handleAuthSuccess(cred);
      });
  }

  getRedirectResult(): Promise<auth.UserCredential> {
    return new Promise((resolve, reject) => {
      this.auth.getRedirectResult()
        .then((cred: auth.UserCredential) => {
          if (cred.user) {
            return resolve(this.handleAuthSuccess(cred));
          }
          return resolve(null);
        })
        .catch(reject);
    });
  }

  signInWithOAuth(providerId: string): Promise<auth.UserCredential>  {
    switch (this.oAuthMethod) {
      case NgxFirebaseAuthOAuthMethod.redirect:
        return this.signInWithRedirect(providerId).then(() => null);
      case NgxFirebaseAuthOAuthMethod.popup:
        return this.signInWithPopup(providerId);
    }
  }

  signInWithPopup(providerId: string): Promise<auth.UserCredential> {
    return this.auth.signInWithPopup(this.getOAuthProviderById(providerId))
      .then((cred: auth.UserCredential) => {
        return this.handleAuthSuccess(cred);
      });
  }

  signInWithRedirect(providerId: string): Promise<void> {
    return this.auth.signInWithRedirect(this.getOAuthProviderById(providerId));
  }

  getOAuthProviderById(id: string): auth.AuthProvider {
    if (this.options.authProviderFactory) {
      return this.options.authProviderFactory(id);
    }
    switch (id) {
      case 'twitter.com': return new auth.TwitterAuthProvider();
      case 'facebook.com': return new auth.FacebookAuthProvider();
      case 'github.com': return new auth.GithubAuthProvider();
      case 'google.com': return new auth.GoogleAuthProvider();
    }
    return null;
  }

  cancelAuthRedirect() {
    this._authRedirectCancelled = true;
  }

  handleAuthSuccess(cred: auth.UserCredential) {
    this._authRedirectCancelled = false;
    this._onAuth.next(cred);
    if (! this.authRedirectCancelled) {
      this.router.navigate([this.baseRoute]);
    }
    return cred;
  }


  getRememberOnDevice(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const stored = window.localStorage.getItem(NgxFirebaseAuthService.persistenceStorageKey);
      switch (stored) {
        case auth.Auth.Persistence.LOCAL:
          return resolve(true);
        case auth.Auth.Persistence.SESSION:
          return resolve(false);
        default:
          return this.setRememberOnDevice(true)
            .then(resolve).catch(reject);
      }
    });
  }

  setRememberOnDevice(b: boolean): Promise<boolean> {
    const persistence = b ? auth.Auth.Persistence.LOCAL : auth.Auth.Persistence.SESSION;
    return this.auth.setPersistence(persistence)
      .then(() => {
        window.localStorage.setItem(NgxFirebaseAuthService.persistenceStorageKey, persistence);
        return b;
      });
  }

  fetchSignInMethodsForEmail(email: string): Promise<string[]> {
    return this.auth.fetchSignInMethodsForEmail(email);
  }

  handleOob(queryParams: {[key: string]: any}): Promise<INgxFirebaseAuthOobResult> {
    const opsToModes = {
      PASSWORD_RESET: 'resetPassword',
      RECOVER_EMAIL: 'recoverEmail',
      VERIFY_EMAIL: 'verifyEmail'
    };

    return new Promise((resolve) => {
      const result: INgxFirebaseAuthOobResult = {
        mode: Object.values(opsToModes).indexOf(queryParams.mode) > -1 ? queryParams.mode : null,
        code: queryParams.oobCode || null,
        email: null,
        fromEmail: null,
        error: null
      };
      if ((! result.mode) || (! result.code)) {
        result.error = {
          message: 'Missing oob parameters.',
          code: 'ngx-fire-auth/missing-oob-parameters'
        };
        return resolve(result);
      }
      this.auth.checkActionCode(result.code)
        .then((info: auth.ActionCodeInfo) => {
          result.email = info.data.email;
          result.fromEmail = info.data.fromEmail || null;
          result.mode = opsToModes[info.operation];
          resolve(result);
        })
        .catch((error: auth.Error) => {
          result.error = error;
          resolve(result);
        });
    });
  }

  applyActionCode(oobCode: string): Promise<void> {
    return this.auth.applyActionCode(oobCode);
  }
  confirmPasswordReset(oobCode: string, email: string, password: string): Promise<auth.UserCredential> {
    return this.auth.confirmPasswordReset(oobCode, password)
      .then(() => {
        return this.signInWithPassword(email, password);
      });
  }

  sendEmailVerification(user: User): Promise<void> {
    return user.sendEmailVerification();
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return this.auth.sendPasswordResetEmail(email);
  }
}
