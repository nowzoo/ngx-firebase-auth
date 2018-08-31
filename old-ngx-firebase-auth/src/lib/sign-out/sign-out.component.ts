import { Component, OnInit } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import {
  NgxFirebaseAuthRoute
} from '../shared';

@Component({
  selector: 'ngx-firebase-auth-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.css']
})
export class SignOutComponent implements OnInit {

  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _router: Router
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  get router(): Router {
    return this._router;
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.signOut);
    this.auth.signOut()
      .then(() => {
        this.router.navigate(this.authService.getSignInRouterLink());
      });
  }

}