import { Component, OnInit } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthRoute, INgxFirebaseActionCodeSuccess } from '../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-verify-email',
  templateUrl: './oob-verify-email.component.html',
  styleUrls: ['./oob-verify-email.component.css']
})
export class OobVerifyEmailComponent implements OnInit {

  screen: 'wait' | 'error' | 'success' = 'wait';
  unhandledError: auth.Error = null;
  actionCodeInfo: auth.ActionCodeInfo = null;
  actionCodeSuccess: INgxFirebaseActionCodeSuccess = null;


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


  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.oobVerifyEmail);
    const oobCode = this.queryParams.oobCode;
    this.auth.checkActionCode(oobCode)
      .then((result: auth.ActionCodeInfo) => {
        this.actionCodeInfo = result;
        this.submit();
      })
      .catch((error: auth.Error) => {
        this.unhandledError = error;
        this.screen = 'error';
      });
  }

  submit() {
    this.unhandledError = null;
    this.actionCodeSuccess = null;
    const oobCode = this.queryParams.oobCode;
    this.auth.applyActionCode(oobCode)
      .then(() => {
        return this.authService.pushActionCodeSuccess(this.actionCodeInfo);
      })
      .then((success: INgxFirebaseActionCodeSuccess) => {
        this.actionCodeSuccess = success;
        this.screen = 'success';
      })
      .catch((error: auth.Error) => {
        this.unhandledError = error;
        this.screen = 'error';
      });
  }

}
