import { Component, OnInit } from '@angular/core';
import { auth } from 'firebase/app';
import { Observable } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFirebaseAuthRoute, INgxFirebaseActionCodeSuccess } from '../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-recover-email',
  templateUrl: './oob-recover-email.component.html',
  styleUrls: ['./oob-recover-email.component.css']
})
export class OobRecoverEmailComponent implements OnInit {

  screen: 'wait' | 'form' | 'error' | 'success' = 'wait';
  unhandledError: auth.Error = null;
  actionCodeInfo: auth.ActionCodeInfo = null;
  submitting = false;

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
    this.authService.setRoute(NgxFirebaseAuthRoute.oobRecoverEmail);
    const oobCode = this.queryParams.oobCode;
    this.auth.checkActionCode(oobCode)
      .then((result: auth.ActionCodeInfo) => {
        this.actionCodeInfo = result;
        this.screen = 'form';
      })
      .catch((error: auth.Error) => {
        this.unhandledError = error;
        this.screen = 'error';
      });
  }

  submit() {
    this.unhandledError = null;
    const oobCode = this.queryParams.oobCode;
    this.auth.applyActionCode(oobCode)
      .then(() => {
        return this.authService.pushActionCodeSuccess(this.actionCodeInfo);
      })
      .then((success: INgxFirebaseActionCodeSuccess) => {
        this.screen = 'success';
      })
      .catch((error: auth.Error) => {
        this.unhandledError = error;
        this.screen = 'error';
      });
  }


}
