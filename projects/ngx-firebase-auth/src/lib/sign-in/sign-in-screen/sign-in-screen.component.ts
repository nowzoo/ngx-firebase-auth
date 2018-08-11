import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth } from 'firebase/app';
import { NgxFormUtils } from '@nowzoo/ngx-form';

@Component({
  selector: 'ngx-firebase-auth-sign-in-screen',
  templateUrl: './sign-in-screen.component.html',
  styleUrls: ['./sign-in-screen.component.css']
})
export class SignInScreenComponent implements OnInit {

  @Input() email = '';
  @Output() showScreen: EventEmitter<{screen: string, email?: string}> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();

  formId = 'ngx-firebase-auth-sign-in-screen-';
  submitting = false;
  emailFc: FormControl;
  passwordFc: FormControl;
  rememberFc: FormControl;
  fg: FormGroup;
  showInvalid = NgxFormUtils.showInvalid;
  methodsForEmail: string[] = [];

  constructor(
    private _afAuth: AngularFireAuth
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  ngOnInit() {
    this.emailFc = new FormControl(this.email, {validators: [Validators.required, Validators.email]});
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(true);
    this.fg = new FormGroup({email: this.emailFc, password: this.passwordFc, remember: this.rememberFc});
  }

  submit() {
    let cred: auth.UserCredential;
    this.submitting = true;
    this.methodsForEmail = [];
    const email = this.emailFc.value.trim();
    const password = this.passwordFc.value;
    const persistence = this.rememberFc.value ? auth.Auth.Persistence.LOCAL : auth.Auth.Persistence.SESSION;
    this.passwordFc.markAsTouched();
    this.emailFc.markAsTouched();

    this.auth.fetchSignInMethodsForEmail(email)
      .then(results => {
        this.methodsForEmail = results;
        if (results.length === 0) {
          return Promise.reject({code: 'auth/user-not-found'});
        }
        if (results.indexOf('password') === -1) {
          return Promise.reject({code: 'auth/no-password'});
        }
        return this.auth.signInWithEmailAndPassword(email, password);
      })
      .then((result: auth.UserCredential) => {
        cred = result;
        return this.auth.setPersistence(persistence);
      })
      .then(() => {
        this.success.emit(cred);
        this.submitting = false;
      })
      .catch((error: auth.Error) => {
        switch (error.code) {
          case 'auth/no-password':
          case 'auth/user-not-found':
          case 'auth/invalid-email':
          case 'auth/user-disabled':
            NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
            break;
          case 'auth/wrong-password':
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
