import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { ActivatedRoute, ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import {
  NgxFirebaseAuthRoute,
  NgxFirebaseAuthOAuthMethod,
  INgxFirebaseActionCodeSuccess
} from './shared';
@Injectable({
  providedIn: 'root'
})
export class NgxFirebaseAuthService {

  private _oAuthMethod: NgxFirebaseAuthOAuthMethod = NgxFirebaseAuthOAuthMethod.redirect;
  private _redirectCancelled = false;
  private _route$: Subject<NgxFirebaseAuthRoute> = new Subject();
  private _cred$: Subject<auth.UserCredential> = new Subject();
  private _actionCodeSuccess$: Subject<INgxFirebaseActionCodeSuccess> = new Subject();


  private _successMessage: string = null;

  private _baseRouteSlugs: string[] = [];

  constructor(
    private _afAuth: AngularFireAuth
  ) { }

  get authState(): Observable<User> {
    return this._afAuth.authState;
  }

  get route(): Observable<NgxFirebaseAuthRoute> {
    return this._route$.asObservable();
  }

  get redirectCancelled(): boolean {
    return this._redirectCancelled;
  }

  set redirectCancelled(cancelled: boolean) {
    this._redirectCancelled = cancelled;
  }

  get oAuthMethod(): NgxFirebaseAuthOAuthMethod {
    return this._oAuthMethod;
  }

  set oAuthMethod(method: NgxFirebaseAuthOAuthMethod) {
    this._oAuthMethod = method;
  }

  get successMessage(): string {
    return this._successMessage;
  }
  set successMessage(message: string|null) {
    this._successMessage = message;
  }

  get baseRouteSlugs(): string[] {
    return this._baseRouteSlugs.map(s => s);
  }

  setRoute(route: NgxFirebaseAuthRoute) {
    this._route$.next(route);
  }
  pushCred(cred: auth.UserCredential) {
    this.redirectCancelled = false;
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

  getIndexRouterLink(): string[] {
    return this.baseRouteSlugs;
  }
  getSignInRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['sign-in']);
  }

  getSignUpRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['sign-up']);
  }

  getResetPasswordRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['reset-password']);
  }

  getOAuthSignInRouterLink(): string[] {
    return this.baseRouteSlugs.concat(['sign-in', 'oauth']);
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

}
