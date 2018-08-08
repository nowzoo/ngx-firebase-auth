import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { auth } from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute } from '@angular/router';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthRoute } from '../shared';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';


@Component({
  selector: 'ngx-firebase-auth-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {


  screen: 'form' | 'success' | 'error' = 'form';
  showInvalid = NgxFormUtils.showInvalid;
  formId = 'ngx-firebase-auth-reset-password-';
  submitting = false;
  unhandledError: auth.Error = null;
  emailFc: FormControl;
  fg: FormGroup;


  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
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




  initFg() {
    this.emailFc = new FormControl(
      this.queryParams.email || '',
      {asyncValidators: this.authService.emailHasPasswordValidator, updateOn: 'blur'}
    );
    this.fg = new FormGroup({email: this.emailFc});
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.resetPassword);
    this.initFg();
  }

  reset() {
    this.screen = 'form';
    this.unhandledError = null;
    this.submitting = false;
  }


  submit() {
    this.submitting = true;
    this.unhandledError = null;
    const email = this.emailFc.value.trim();
    return this.auth.sendPasswordResetEmail(email)
      .then(() => {
        this.submitting = false;
        this.screen = 'success';
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        this.unhandledError = error;
        this.screen = 'error';
      });
  }
}
