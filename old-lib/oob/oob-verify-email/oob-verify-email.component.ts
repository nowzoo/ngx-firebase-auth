import { Component, OnInit, Input } from '@angular/core';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { auth } from 'firebase/app';

import {
  INgxFirebaseAuthOobResult, NgxFirebaseAuthRoute
} from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-verify-email',
  templateUrl: './oob-verify-email.component.html',
  styleUrls: ['./oob-verify-email.component.css']
})
export class OobVerifyEmailComponent implements OnInit {

  @Input() result: INgxFirebaseAuthOobResult;

  submitting = false;
  error: auth.Error = null;
  screen: 'wait' | 'error' | 'success' = 'wait';
  constructor(
    private _authService: NgxFirebaseAuthService
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.verifyEmailCode);
    if (this.result.error) {
      this.error = this.result.error;
      this.screen = 'error';
    } else {
      this.submit();
    }
  }

  submit() {
    this.submitting = true;
    this.authService.applyActionCode(this.result.code)
      .then(() => {
        this.screen = 'success';
      })
      .catch((error: auth.Error) => {
        this.error = error;
        this.screen = 'error';
      });
  }


}
