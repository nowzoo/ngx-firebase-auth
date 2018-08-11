import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth } from 'firebase/app';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';

@Component({
  selector: 'ngx-firebase-auth-sign-up-screen',
  templateUrl: './sign-up-screen.component.html',
  styleUrls: ['./sign-up-screen.component.css']
})
export class SignUpScreenComponent implements OnInit {

  @Input() email = '';
  @Output() showScreen: EventEmitter<{screen: string, email?: string}> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();

  formId = 'ngx-firebase-auth-sign-up-screen-';
  submitting = false;
  nameFc: FormControl;
  emailFc: FormControl;
  passwordFc: FormControl;
  rememberFc: FormControl;
  fg: FormGroup;
  showInvalid = NgxFormUtils.showInvalid;

  constructor(
    private _afAuth: AngularFireAuth
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  ngOnInit() {
    this.nameFc = new FormControl('', {validators: [Validators.required, NgxFormValidators.requiredString]});
    this.emailFc = new FormControl(this.email, {validators: [Validators.required, Validators.email]});
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(true);
    this.fg = new FormGroup({
      name: this.nameFc,
      email: this.emailFc,
      password: this.passwordFc,
      remember: this.rememberFc
    });
  }

  submit() {
    let cred: auth.UserCredential;
    this.submitting = true;
    const name = this.nameFc.value.trim();
    const email = this.emailFc.value.trim();
    const password = this.passwordFc.value;
    const persistence = this.rememberFc.value ? auth.Auth.Persistence.LOCAL : auth.Auth.Persistence.SESSION;
    this.passwordFc.markAsTouched();
    this.emailFc.markAsTouched();
    this.auth.createUserWithEmailAndPassword(email, password)
      .then((result: auth.UserCredential) => {
        cred = result;
        return cred.user.updateProfile({displayName: name, photoURL: null});
      })
      .then(() => {
        return this.auth.setPersistence(persistence);
      })

      .then(() => {
        this.success.emit(cred);
        this.submitting = false;
      })
      .catch((error: auth.Error) => {
        switch (error.code) {
          case 'auth/email-already-in-use':
          case 'auth/invalid-email':
            NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
            break;
          case 'auth/weak-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
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
