import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth } from 'firebase/app';
import { NgxFormUtils } from '@nowzoo/ngx-form';

@Component({
  selector: 'ngx-firebase-auth-reset-password-screen',
  templateUrl: './reset-password-screen.component.html',
  styleUrls: ['./reset-password-screen.component.css']
})
export class ResetPasswordScreenComponent implements OnInit {

  @Input() email = '';
  @Output() showScreen: EventEmitter<{screen: string, email?: string}> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();

  screen: 'form' | 'success' = 'form';
  formId = 'ngx-firebase-auth-reset-password-screen-';
  submitting = false;
  emailFc: FormControl;
  fg: FormGroup;
  showInvalid = NgxFormUtils.showInvalid;

  constructor(
    private _afAuth: AngularFireAuth
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  ngOnInit() {
    this.emailFc = new FormControl(this.email, {validators: [Validators.required, Validators.email]});
    this.fg = new FormGroup({email: this.emailFc});
  }

  submit() {
    this.submitting = true;
    const email = this.emailFc.value.trim();
    this.emailFc.markAsTouched();
    this.auth.sendPasswordResetEmail(email)
      .then(() => {
        this.screen = 'success';
      })
      .catch((error: auth.Error) => {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/invalid-email':
            NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
            break;
          default:
            this.error.emit(error);
            break;
        }
        this.submitting = false;
      });
  }
  switchScreen(screen: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.showScreen.emit({screen: screen, email: this.emailFc.value});
  }

}
