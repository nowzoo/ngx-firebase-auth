import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { auth } from 'firebase/app';

import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import {
  INgxFirebaseAuthOobResult,
  NgxFirebaseAuthRoute
} from '../shared';

@Component({
  selector: 'ngx-firebase-auth-oob',
  templateUrl: './oob.component.html',
  styleUrls: ['./oob.component.css']
})
export class OobComponent implements OnInit {

  screen: 'wait' | 'resetPassword' | 'verifyEmail' | 'recoverEmail' | 'error' = 'wait';
  result: INgxFirebaseAuthOobResult = null;
  error: auth.Error = null;
  constructor(
    private _route: ActivatedRoute,
    private _authService: NgxFirebaseAuthService
  ) { }

  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.oob);
    this.authService.handleOob(this.queryParams)
      .then((result: INgxFirebaseAuthOobResult) => {
        this.result = result;
        if (result.error) {
          switch (result.error.code) {
            case 'ngx-fire-auth/missing-oob-parameters':
              this.error = result.error;
              this.screen = 'error';
              return;
          }
        }
        this.screen = result.mode;
      });
  }

}
