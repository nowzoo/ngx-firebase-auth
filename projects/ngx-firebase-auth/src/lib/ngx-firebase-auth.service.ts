import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { auth } from 'firebase/app';
import {
  NgxFirebaseAuthRoute,
  NgxFirebaseAuthOAuthMethod
} from './shared';
@Injectable({
  providedIn: 'root'
})
export class NgxFirebaseAuthService {

  private _oAuthMethod: NgxFirebaseAuthOAuthMethod = NgxFirebaseAuthOAuthMethod.redirect;
  private _redirectCancelled = false;
  private _route$: Subject<NgxFirebaseAuthRoute> = new Subject();
  private _cred$: Subject<auth.UserCredential> = new Subject();

  constructor() { }

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

  setRoute(route: NgxFirebaseAuthRoute) {
    this._route$.next(route);
  }
  pushCred(cred: auth.UserCredential) {
    this.redirectCancelled = false;
    this._cred$.next(cred);
  }
}
