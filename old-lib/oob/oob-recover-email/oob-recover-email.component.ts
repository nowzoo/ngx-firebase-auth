import { Component, OnInit, Input } from '@angular/core';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { auth } from 'firebase/app';

import {
  INgxFirebaseAuthOobResult, NgxFirebaseAuthRoute
} from '../../shared';
@Component({
  selector: 'ngx-firebase-auth-oob-recover-email',
  templateUrl: './oob-recover-email.component.html',
  styleUrls: ['./oob-recover-email.component.css']
})
export class OobRecoverEmailComponent implements OnInit {
  @Input() result: INgxFirebaseAuthOobResult;

  submitting = false;
  error: auth.Error = null;
  screen: 'form' | 'error' | 'success';
  constructor(
    private _authService: NgxFirebaseAuthService
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.recoverEmailCode);
    if (this.result.error) {
      this.error = this.result.error;
      this.screen = 'error';
    } else {
      this.screen = 'form';
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
