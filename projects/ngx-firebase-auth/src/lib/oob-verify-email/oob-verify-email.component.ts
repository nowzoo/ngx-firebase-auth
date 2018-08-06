import { Component, OnInit } from '@angular/core';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import {
  NgxFirebaseAuthRoute, INgxFirebaseActionCodeSuccess
} from '../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-verify-email',
  templateUrl: './oob-verify-email.component.html',
  styleUrls: ['./oob-verify-email.component.css']
})
export class OobVerifyEmailComponent implements OnInit {

  screen: 'wait' | 'error' = 'wait';
  error: auth.Error = null;
  cred: auth.UserCredential;
  actionCodeInfo: auth.ActionCodeInfo = null;



  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router
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

  get router(): Router {
    return this._router;
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
        this.error = error;
        this.screen = 'error';
      });
  }

  submit() {
    this.error = null;
    const oobCode = this.queryParams.oobCode;
    this.auth.applyActionCode(oobCode)
      .then(() => {
        return this.authService.pushActionCodeSuccess(this.actionCodeInfo);
      })
      .then((success: INgxFirebaseActionCodeSuccess) => {
        this.screen = null;
        if (! this.authService.redirectCancelled) {
          this.authService.successMessage = `Your email "${this.actionCodeInfo.data.email}" has been verified.`;
          if (success.user) {
            this.router.navigate(this.authService.getIndexRouterLink());
          } else {
            this.router.navigate(
              this.authService.getSignInRouterLink(),
              {queryParams: {email: this.actionCodeInfo.data.email}}
            );
          }
        }
      })
      .catch((error: auth.Error) => {
        this.error = error;
        this.screen = 'error';
      });
  }

}
