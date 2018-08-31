import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { INgxFirebaseAuthOobSuccess } from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-recover-email',
  templateUrl: './oob-recover-email.component.html',
  styleUrls: ['./oob-recover-email.component.scss']
})
export class OobRecoverEmailComponent implements OnInit {

  @Input() oobCode: string;
  @Output() success: EventEmitter<INgxFirebaseAuthOobSuccess> = new EventEmitter();

  screen: 'wait' | 'form' | 'error' | 'success' = 'wait';
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
        this.screen = 'form';
      })
      .catch((error: auth.Error) => {
        this.unhandledError = error;
        this.screen = 'error';
      });
  }

  submit() {
    this.auth.applyActionCode(this.oobCode)
      .then(() => {
        this.screen = 'success';
        this.success.emit({
          mode: 'recoverEmail',
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
