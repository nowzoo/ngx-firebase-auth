import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFirebaseAuthRoute } from '../shared';
@Component({
  selector: 'ngx-firebase-auth-oob',
  templateUrl: './oob.component.html',
  styleUrls: ['./oob.component.css']
})
export class OobComponent implements OnInit {

  screen: 'wait' | 'error' = 'wait';

  constructor(
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

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
    this.authService.setRoute(NgxFirebaseAuthRoute.oob);
    const mode = this.queryParams.mode || null;
    const oobCode = this.queryParams.oobCode || null;
    if ((! mode) || (! oobCode)) {
      this.screen = 'error';
      return;
    }
    switch (mode) {
      case 'resetPassword':
        this.router.navigate(this.authService.getOobResetPasswordRouterLink(), {queryParamsHandling: 'merge'});
        return;
      case 'verifyEmail':
        this.router.navigate(this.authService.getOobVerifyEmailRouterLink(), {queryParamsHandling: 'merge'});
        return;
      case 'recoverEmail':
        this.router.navigate(this.authService.getOobRecoverEmailRouterLink(), {queryParamsHandling: 'merge'});
        return;
      default:
        this.screen = 'error';
        return;
    }
  }

}
