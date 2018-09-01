import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { INgxFirebaseAuthOobSuccess } from '../../shared';
import { NgxFirebaseAuthFormHelper } from '../../form-helper';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { screenAnimation } from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-oob-reset-password',
  templateUrl: './oob-reset-password.component.html',
  styleUrls: ['./oob-reset-password.component.scss'],
  animations: [screenAnimation]
})
export class OobResetPasswordComponent implements OnInit {

  @Input() oobCode: string;
  @Output() success: EventEmitter<INgxFirebaseAuthOobSuccess> = new EventEmitter();

  screen: 'wait' | 'form' | 'error' | 'success' = 'wait';
  info: auth.ActionCodeInfo;
  submitting = false;
  formId = 'ngx-firebase-auth-oob-reset-password-';
  fg: FormGroup;
  emailFc: FormControl;
  passwordFc: FormControl;
  rememberFc: FormControl;
  unhandledError: auth.Error = null;
  cred: auth.UserCredential = null;
  constructor(
    private _afAuth: AngularFireAuth,
      private _authService: NgxFirebaseAuthService,
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }
  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {
    const remembered = this.authService.getRemembered();
    this.emailFc = new FormControl('');
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(remembered.remember);
    this.fg = new FormGroup({email: this.emailFc, password: this.passwordFc, remember: this.rememberFc});
    this.auth.checkActionCode(this.oobCode)
      .then((result: auth.ActionCodeInfo) => {
        this.info = result;
        this.emailFc.setValue(result.data.email);
        this.screen = 'form';
      })
      .catch((error: auth.Error) => {
        this.unhandledError = error;
        this.screen = 'error';
      });
  }

  submit() {
    this.submitting = true;
    this.auth.confirmPasswordReset(this.oobCode, this.passwordFc.value)
      .then(() => {
        return this.auth.signInWithEmailAndPassword(this.info.data.email, this.passwordFc.value);
      })
      .then((cred: auth.UserCredential) => {
        this.cred = cred;
        return this.authService.setRemembered(this.rememberFc.value === true, this.info.data.email);
      })
      .then(() => {
        this.screen = 'success';
        this.success.emit({
          mode: 'resetPassword',
          info: this.info,
          cred: this.cred,
          user: this.cred.user
        });
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        this.passwordFc.markAsDirty();
        this.passwordFc.markAsTouched();
        switch (error.code) {
          case 'auth/weak-password':
            NgxFirebaseAuthFormHelper.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.unhandledError = error;
            this.screen = 'error';
            break;
        }
      });
  }

}
