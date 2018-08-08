import { Component, OnInit, NgZone, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS,
  INgxFirebaseAuthOptions,
  INgxFirebaseAuthMethodsForEmailResult,
  ngxFirebaseAuthOAuthProviderNames
} from '../shared';

@Component({
  selector: 'ngx-firebase-auth-unified-sign-in',
  templateUrl: './unified-sign-in.component.html',
  styleUrls: ['./unified-sign-in.component.css']
})
export class UnifiedSignInComponent implements OnInit {

  screen: 'wait' | 'methods' | 'signIn' | 'signUp' | 'success' | 'error' = 'wait';
  unhandledError: auth.Error =  null;
  cred: auth.UserCredential = null;
  email =  '';
  methodsForEmail: INgxFirebaseAuthMethodsForEmailResult =  null;


  constructor(
    @Inject(NGX_FIREBASE_AUTH_OPTIONS) private _options: INgxFirebaseAuthOptions,
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _ngZone: NgZone
  ) { }

  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get options(): INgxFirebaseAuthOptions {
    return this._options;
  }


  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  getProviderName(id) {
    return ngxFirebaseAuthOAuthProviderNames[id] ? ngxFirebaseAuthOAuthProviderNames[id] : id;
  }


  ngOnInit() {
    this.reset();
  }

  reset() {
    if (this.methodsForEmail) {
      this.email = this.methodsForEmail.email;
    } else {
      this.email = this.queryParams.email || '';
    }
    this.screen = 'methods';
    this.unhandledError = null;
    this.methodsForEmail = null;
  }

  onUnhandledError(error: auth.Error) {
    this.unhandledError = error;
    this.screen = 'error';
  }

  onSignInMethodsResult(result: INgxFirebaseAuthMethodsForEmailResult) {
    this.methodsForEmail = result;
    if (result.methods.length > 0) {
      this.screen = 'signIn';
    } else {
      this.screen = 'signUp';
    }
  }

  onSuccess(cred: auth.UserCredential) {
    this.cred = cred;
    this.screen = 'success';
  }



}
