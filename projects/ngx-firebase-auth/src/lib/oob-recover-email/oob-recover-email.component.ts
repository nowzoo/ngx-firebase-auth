import { Component, OnInit } from '@angular/core';
import { auth, User } from 'firebase/app';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFirebaseAuthRoute, INgxFirebaseActionCodeSuccess } from '../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-recover-email',
  templateUrl: './oob-recover-email.component.html',
  styleUrls: ['./oob-recover-email.component.css']
})
export class OobRecoverEmailComponent implements OnInit {

  screen: 'wait' | 'form' | 'error' = 'wait';
  error: auth.Error = null;
  actionCodeInfo: auth.ActionCodeInfo = null;
  submitting = false;

  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }
  get authState(): Observable<User> {
    return this._afAuth.authState;
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
    this.authService.setRoute(NgxFirebaseAuthRoute.oobRecoverEmail);
    const oobCode = this.queryParams.oobCode;
    this.auth.checkActionCode(oobCode)
      .then((result: auth.ActionCodeInfo) => {
        this.actionCodeInfo = result;
        this.screen = 'form';
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
          this.authService.successMessage = `Your email has been changed back to ` +
            `${this.actionCodeInfo.data.email} from ${this.actionCodeInfo.data.fromEmail}.`;
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
