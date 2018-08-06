import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS, INgxFirebaseAuthOptions
} from '../shared';
@Component({
  selector: 'ngx-firebase-auth-oauth-sign-in',
  templateUrl: './oauth-sign-in.component.html',
  styleUrls: ['./oauth-sign-in.component.css']
})
export class OauthSignInComponent implements OnInit {
  private _signInMethodsForEmail: string[] = null;
  error: auth.Error = null;
  screen: 'wait' | 'error' | 'accountExistsError' | 'popupBlockedError' | 'popupCancelledError' | 'form' = 'wait';
  currentProviderId: string = null;
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
    this.authService.setRoute(NgxFirebaseAuthRoute.oAuthSignIn);
    this.handleRedirect()
      .then((handled: boolean) => {
        if (! handled) {
          if (this.queryParams.providerId) {
            this.submit(this.queryParams.providerId);
          } else {
            this.screen = 'form';
          }
        }
      });
  }

  handleRedirect(): Promise<boolean> {
    return new Promise(resolve => {
      this.auth.getRedirectResult()
        .then((cred: auth.UserCredential) => {
          if (cred.user) {
            this.onSuccess(cred);
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          this.onError(error);
          resolve(true);
        });
    });
  }

  getProvider(providerId: string): auth.AuthProvider {
    let provider: auth.AuthProvider = null;
    if (this.options.authProviderFactory) {
      provider = this.options.authProviderFactory(providerId);
    } else {
      switch (providerId) {
        case 'google.com':
          provider = new auth.GoogleAuthProvider();
          break;
        case 'github.com':
          provider = new auth.GithubAuthProvider();
          break;
        case 'facebook.com':
          provider = new auth.FacebookAuthProvider();
          break;
        case 'twitter.com':
          provider = new auth.TwitterAuthProvider();
          break;
      }
    }
    return provider;
  }

  submit(providerId: string) {
    this.screen = 'wait';
    this.error = null;
    this.currentProviderId = providerId;
    const provider: auth.AuthProvider = this.getProvider(providerId);
    if (! provider) {
      this.onError({
        code: 'ngx-firebase-auth/no-provider-found',
        message: `No OAuth provider found for id "${providerId}".`
      });
      return;
    }
    if (this.authService.oAuthMethod === NgxFirebaseAuthOAuthMethod.popup) {
      this.auth.signInWithPopup(provider)
        .then((cred) => this.onSuccess(cred))
        .catch((error) => this.onError(error));
    } else {
      this.auth.signInWithRedirect(provider)
        .catch((error) => this.onError(error));
    }
  }
  onSuccess(cred: auth.UserCredential) {
    this.authService.pushCred(cred);
    if (! this.authService.redirectCancelled) {
      this.router.navigate(['../'], {relativeTo: this.route});
    }
  }
  onError(error: auth.Error) {
    const email = (error as any).email || null;
    if (email) {
      this.auth.fetchSignInMethodsForEmail(email)
        .then(results => {
          this.signInMethodsForEmail = results;
          this.error = error;
          this.screen = 'accountExistsError';
        });
    } else {
      this.error = error;
      this.signInMethodsForEmail = null;
      switch (error.code) {
        case 'auth/popup-blocked':
          this.screen = 'popupBlockedError';
          break;
        case 'auth/popup-closed-by-user':
          this.screen = 'popupCancelledError';
          break;
        default:
          this.error = error;
          this.screen = 'error';
          break;
      }
    }
  }
}
