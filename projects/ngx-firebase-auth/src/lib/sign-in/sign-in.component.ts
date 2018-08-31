import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, TemplateRef, NgZone} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import {
  fadeInOutAnimation, screenAnimation,
  getOAuthProviderIcon, getOAuthProviderName,
  INgxFirebaseAuthRememberRecord,
  ISignInMethodsForEmailResult
} from '../shared';
import { NgxFirebaseAuthFormHelper } from '../form-helper';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';



@Component({
  selector: 'ngx-firebase-auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  animations: [fadeInOutAnimation, screenAnimation]
})
export class SignInComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  @Input() oAuthProviderIds: string[];
  @Input() useOAuthPopup: boolean;
  @Input() oAuthProviderFactory: (providerId: string) => auth.AuthProvider;
  @Input() tosTemplate: TemplateRef<any> = null;
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();

  remember: boolean;
  email: string;
  initialOAuthError: auth.Error = null;
  signedOut = false;
  oAuthProviderId: string = null;
  cred: auth.UserCredential = null;
  unhandledError: auth.Error = null;

  screen: 'wait' |
    'signIn' | 'signInPassword' | 'signUpPassword' | 'signInOAuth' | 'signInSuccess' |
    'resetPassword' | 'unhandledError' = 'wait';

  constructor(
    private _afAuth: AngularFireAuth,
    private _svc: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _ngZone: NgZone
  ) {
  }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authService(): NgxFirebaseAuthService {
    return this._svc;
  }

  get router(): Router {
    return this._router;
  }

  get route(): ActivatedRoute {
    return this._route;
  }

  get queryParams(): Observable<{[key: string]: any}> {
    return this.route.queryParams;
  }

  get snapshotQueryParams(): {[key: string]: any} {
    return this.route.snapshot.queryParams;
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  init() {
    const rememberRecord = this.authService.getRemembered();
    this.remember = rememberRecord.remember;
    this.email = rememberRecord.email;
    return this.onInitHandleSignOut()
      .then((handled: boolean) => {
        if (handled) {
          return handled;
        }
        return this.onInitHandleOAuthRedirect();
      })
      .then((handled: boolean) => {
        if (! handled) {
          this.showSignIn();
        }
        this.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
          const action = params.action || null;
          switch (action) {
            case 'signOut':
              this.showSignOut();
              break;
            case 'resetPassword':
              this.showResetPassword();
              break;
            case 'signIn':
              this.showSignIn();
              break;
            case 'signInPassword':
              this.showSignInPassword();
              break;
            case 'signUpPassword':
              this.showSignUpPassword();
              break;
            case 'signInOAuth':
              this.showSignInOAuth(params.providerId, null);
              break;
          }
        });
      });
  }

  onInitHandleSignOut(): Promise<boolean> {
    if (this.snapshotQueryParams.action !== 'signOut') {
      return Promise.resolve(false);
    }
    return this.showSignOut().then(() => true);
  }
  onInitHandleOAuthRedirect(): Promise<boolean> {
    return new Promise(resolve => {
      const remember: boolean = this.route.snapshot.queryParams.remember === 'true';
      return this.auth.getRedirectResult()
        .then((cred: auth.UserCredential) => {
          if (this.auth.currentUser && cred.user) {
            this.authService.setRemembered(remember, cred.user.email)
              .then(() => {
                this.showSignInSuccess(cred);
                resolve(true);
              });
          } else {
            resolve(false);
          }
        })
        .catch((error: auth.Error) => {
          this.showSignInOAuth(null, error );
          resolve(true);
        });
    });
  }




  showSignOut(): Promise<any> {
    this.screen = 'wait';
    return this.auth.signOut()
      .then(() => {
        this.showSignIn(true);
      });
  }

  showSignIn(signedOut?: boolean) {
    this.signedOut = signedOut === true;
    this.screen = 'signIn';
  }

  showSignInPassword() {
    this.screen = 'signInPassword';
  }

  showSignUpPassword() {
    this.screen = 'signUpPassword';

  }

  showSignInOAuth(oAuthProviderId: string, error: auth.Error) {
    this.oAuthProviderId = oAuthProviderId;
    this.initialOAuthError = error;
    this.screen = 'signInOAuth';
  }

  showSignInSuccess(cred: auth.UserCredential) {
    this.cred = cred;
    this.screen = 'signInSuccess';
    this.success.emit(cred);
  }

  showResetPassword() {
    this.screen = 'resetPassword';
  }

  showUnhandledError(error: auth.Error) {
    this.unhandledError = error;
    this.screen = 'unhandledError';
  }
}
