import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { INgxFirebaseAuthOobSuccess } from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-verify-email',
  templateUrl: './oob-verify-email.component.html',
  styleUrls: ['./oob-verify-email.component.scss']
})
export class OobVerifyEmailComponent implements OnInit {

  @Input() oobCode: string;
  @Output() success: EventEmitter<INgxFirebaseAuthOobSuccess> = new EventEmitter();

  screen: 'wait' | 'error' | 'success' = 'wait';
  info: auth.ActionCodeInfo;
  submitting = false;
  unhandledError: auth.Error;

  constructor(
    private _afAuth: AngularFireAuth,
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  ngOnInit() {

    this.auth.checkActionCode(this.oobCode)
      .then((result: auth.ActionCodeInfo) => {
        this.info = result;
        return this.auth.applyActionCode(this.oobCode);
      })
      .then(() => {
        this.screen = 'success';
        this.success.emit({
          mode: 'verifyEmail',
          info: this.info,
          user: this.auth.currentUser
        });
      })
      .catch((error: auth.Error) => {
        this.unhandledError = error;
        this.screen = 'error';
      });
  }

}
