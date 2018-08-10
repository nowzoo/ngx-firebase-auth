import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthRoute, EmailSignInMethodsResult } from '../shared';

@Component({
  selector: 'ngx-firebase-auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  screen: 'email' | 'signIn' | 'signUp' | 'success' | 'error' = 'email';
  email: string;
  formId = 'ngx-firebase-auth-sign-in-';
  unhandledError: auth.Error = null;
  cred: auth.UserCredential = null;
  showInvalid = NgxFormUtils.showInvalid;
  methodsForEmail: EmailSignInMethodsResult;



  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute
  ) { }

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

  get emailHasAccount(): boolean {
    return this.methodsForEmail.methods.length > 0;
  }

  get emailHasPassword(): boolean {
    return this.methodsForEmail.methods.indexOf('password') !== -1;
  }



  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.signUp);
    this.reset(this.queryParams.email || '');
  }

  reset(email) {
    this.email = email;
    this.unhandledError = null;
    this.cred = null;
    this.screen = 'email';
  }


  onSignInMethods(methods: EmailSignInMethodsResult) {
    this.methodsForEmail = methods;
    this.screen = this.emailHasAccount ? 'signIn' : 'signUp';
  }


  onAuth(cred: auth.UserCredential) {
    this.cred = cred;
    this.screen = 'success';
    this.authService.pushSignInSuccess(cred);
  }

  onUnhandledError(error: auth.Error) {
    this.unhandledError = error;
    this.screen =  'error';
  }



}
