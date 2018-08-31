import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import { FormGroup, FormControl } from '@angular/forms';

import { getOAuthProviderIcon, getOAuthProviderName } from '../../shared';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';


@Component({
  selector: 'ngx-firebase-auth-sign-in-oauth',
  templateUrl: './sign-in-oauth.component.html',
  styleUrls: ['./sign-in-oauth.component.scss']
})
export class SignInOauthComponent implements OnInit {

  @Input() providerId: string;
  @Input() initialError: auth.Error;
  @Input() useOAuthPopup: boolean;
  @Input() oAuthProviderFactory: (providerId: string) => auth.AuthProvider;
  @Input() email: string;
  @Input() remember: boolean;
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() emailChange: EventEmitter<string> = new EventEmitter();
  @Output() rememberChange: EventEmitter<boolean> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();


  screen: 'wait' | 'methodError' | 'retry' = 'wait';
  methodError: auth.Error = null;
  getOAuthProviderIcon = getOAuthProviderIcon;
  getOAuthProviderName = getOAuthProviderName;
  fg: FormGroup;
  rememberFc: FormControl;
  formId = 'ngx-firebase-auth-sign-in-oauth-';

  constructor(
    private _afAuth: AngularFireAuth,
    private _svc: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authService(): NgxFirebaseAuthService {
    return this._svc;
  }

  get route(): ActivatedRoute {
    return this._route;
  }

  get router(): Router {
    return this._router;
  }

  ngOnInit() {
    this.rememberFc = new FormControl(this.remember);
    this.rememberFc.valueChanges.subscribe(val => this.rememberChange.emit(val));
    this.fg = new FormGroup({
      remember: this.rememberFc
    });
    if (this.initialError) {
      this.handleOAuthError(this.initialError);
    } else {
      this.oAuthSignIn(this.providerId);
    }
  }


  oAuthSignIn(id: string, forceRedirect?: boolean) {
    this.methodError = null;
    let cred: auth.UserCredential;
    if (this.useOAuthPopup  && forceRedirect !== true) {
      this.getOAuthProvider(id)
        .then(provider => {
          return this.auth.signInWithPopup(provider);
        })
        .then((result: auth.UserCredential) => {
          cred = result;
          return this.authService.setRemembered(this.rememberFc.value === true, result.user.email);
        })
        .then(() => {
          this.success.emit(cred);
        })
        .catch(error => this.handleOAuthError(error, id));
    } else {
      this.router.navigate(['.'], {relativeTo: this.route, queryParams: {remember: this.rememberFc.value === true}})
        .then(() => {
          return this.getOAuthProvider(id);
        })
        .then(provider => {
          return this.auth.signInWithRedirect(provider);
        })
        .catch(error => this.handleOAuthError(error, id));
    }
  }

  handleOAuthError(error: auth.Error, providerId?: string) {
    if (error['email'] && error['credential']) {
      this.emailChange.emit(error['email']);
      this.auth.fetchSignInMethodsForEmail(error['email'])
        .then(results => {
          error['methods'] = results;
          error['accountHasPassword'] = results.indexOf('password') !== -1;
          error['accountOAuthMethods'] = results.filter(id => id !== 'password');
          this.methodError = error;
          this.screen = 'methodError';
        });
      return;
    }
    switch (error.code) {
      case 'auth/cancelled-popup-request':
      case 'auth/popup-closed-by-user':
        this.screen = 'retry';
        break;
      case 'auth/popup-blocked':
        this.oAuthSignIn(providerId, true);
        break;
      default:
        this.error.emit(error);
        break;
    }
  }

  getOAuthProvider(id: string): Promise<auth.AuthProvider> {
    let provider: auth.AuthProvider = null;
    if (this.oAuthProviderFactory) {
      provider = this.oAuthProviderFactory(id);
    }
    if (! provider) {
      switch (id) {
        case 'twitter.com':
          provider = new auth.TwitterAuthProvider();
          break;
        case 'facebook.com':
          provider = new auth.FacebookAuthProvider();
          break;
        case 'google.com':
          provider = new auth.GoogleAuthProvider();
          break;
        case 'github.com':
          provider = new auth.GithubAuthProvider();
          break;
      }
    }
    if (provider) {
      return Promise.resolve(provider);
    } else {
      return Promise.reject({
        code: 'ngx-firebase-auth/no-provider-found',
        message: `We could not create an OAuth provider for provider id "${id}".`
      });
    }
  }

}
