import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { auth } from 'firebase/app';
import { combineLatest, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';

import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import {
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS,
  INgxFirebaseAuthOptions,
  ngxFirebaseAuthOAuthProviderNames
} from '../shared';
@Component({
  selector: 'ngx-firebase-auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  static emailFetchDebounce = 1000;

  private _methods: string[] = [];
  private _emailSubscription: Subscription = null;
  private _emailFromRoute = '';

  screen: 'wait' | 'form' | 'success' | 'error' = 'wait';
  formId: string;
  submitting = false;
  emailFc: FormControl;
  fg: FormGroup;
  unhandledError: auth.Error = null;
  showInvalid = NgxFormUtils.showInvalid;
  providerNames = ngxFirebaseAuthOAuthProviderNames;
  childFormBusy = false;
  methodsFetchStatus: 'unfetched' | 'fetching' | 'fetched' = 'unfetched';

  cred: auth.UserCredential = null;


  constructor(
    @Inject(NGX_FIREBASE_AUTH_OPTIONS) private _options: INgxFirebaseAuthOptions,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _ngZone: NgZone
  ) { }

  get options(): INgxFirebaseAuthOptions {
    return this._options;
  }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }


  get methods(): string[] {
    return this._methods;
  }

  get userExists(): boolean {
    return this.methods.length > 0;
  }

  get userHasPassword(): boolean {
    return this.methods.indexOf('password') > -1;
  }

  get userOAuthMethods(): string[] {
    return this.methods.filter(id => 'password' !== id);
  }

  get passwordSignUpEnabled(): boolean {
    return this.options.methods.indexOf('password') > -1;
  }

  get oAuthSignUpMethodsEnabled(): string[] {
    return this.options.methods.filter(id => 'password' !== id);
  }

  get emailSubscription(): Subscription {
    return this._emailSubscription;
  }

  get emailFromRoute(): string {
    return this._emailFromRoute;
  }

  setChildFormBusy(busy: boolean) {
    this.childFormBusy = busy;
  }

  showSuccess(cred: auth.UserCredential) {
    this.cred = cred;
    this.screen = 'success';
  }

  showError(error: auth.Error) {
    this.unhandledError = error;
    this.screen = 'error';
  }

  showForm() {
    if (this.emailSubscription) {
      this.emailSubscription.unsubscribe();
    }
    this.emailFc = new FormControl(this.emailFromRoute, {validators: [Validators.required, Validators.email]});
    this.fg = new FormGroup({
      email: this.emailFc,
    });
    this._emailSubscription = combineLatest(this.emailFc.valueChanges, this.emailFc.statusChanges)
      .pipe(debounceTime(SignInComponent.emailFetchDebounce))
      .subscribe(() => {
        this.onEmailValue();
      });
    this.onEmailValue();
    this.screen = 'form';

  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.signIn);
    this._emailFromRoute = this.queryParams.email || '';
    this.formId = NgxFirebaseAuthService.uniqueId();
    this.authService.getRedirectResult()
      .then((cred: auth.UserCredential) => {
        if (! cred) {
          this.showForm();
        } else {
          this.showSuccess(cred);
        }
      })
      .catch((error: auth.Error) => {
        this.showError(error);
      });
  }

  onEmailValue() {
    this.unhandledError = null;
    this.methodsFetchStatus = 'fetching';
    this.setChildFormBusy(false);
    this._ngZone.runOutsideAngular(() => {
      if (this.emailFc.status !== 'VALID') {
        this._ngZone.run(() => {
          this._methods = [];
          this.methodsFetchStatus = 'unfetched';
        });
        return;
      }
      this.authService.fetchSignInMethodsForEmail(this.emailFc.value)
        .then((results) => {
          this._ngZone.run(() => {
            this._methods = results;
            this.methodsFetchStatus = 'fetched';
          });
        })
        .catch((error: auth.Error) => {
          this._ngZone.run(() => {
            switch (error.code) {
              case 'auth/invalid-email':
                NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
                break;
              default:
                this.unhandledError = error;
                break;
            }
            this.methodsFetchStatus = 'unfetched';
          });
        });
    });
  }

  signInWithOAuth(providerId: string) {
    this.authService.signInWithOAuth(providerId)
      .then((cred: auth.UserCredential) => {
        if (cred) {
          this.showSuccess(cred);
        }
      })
      .catch((error: auth.Error) => {
        this.showError(error);
      });
  }

}
