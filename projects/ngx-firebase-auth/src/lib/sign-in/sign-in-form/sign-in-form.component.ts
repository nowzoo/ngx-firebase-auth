import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';

import { NgxFirebaseAuthFormHelper } from '../../form-helper';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { getOAuthProviderIcon, getOAuthProviderName, fadeInOutAnimation } from '../../shared';


@Component({
  selector: 'ngx-firebase-auth-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.scss'],
  animations: [fadeInOutAnimation]
})
export class SignInFormComponent implements OnInit, AfterViewInit {

  @ViewChild('passwordInput') passwordInput: ElementRef;
  @Input() email: string;
  @Input() remember: boolean;
  @Output() rememberChange: EventEmitter<boolean> = new EventEmitter();
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();

  formId = 'ngx-firebase-auth-sign-in-form-';
  submitting = false;
  fg: FormGroup;
  emailFc: FormControl;
  passwordFc: FormControl;
  rememberFc: FormControl;
  methodsForEmail: string[] = [];
  getOAuthProviderIcon = getOAuthProviderIcon;
  getOAuthProviderName = getOAuthProviderName;
  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }


  ngOnInit() {
    this.emailFc = new FormControl(
      this.email,
      {validators: [Validators.required, Validators.email]}
    );
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.rememberFc = new FormControl(this.remember);
    this.rememberFc.valueChanges.subscribe(val => this.rememberChange.emit(val));
    this.fg = new FormGroup({
      email: this.emailFc,
      password: this.passwordFc,
      remember: this.rememberFc
    });
  }
  ngAfterViewInit() {
    this.passwordInput.nativeElement.focus();
  }



  submit() {
    const email = this.emailFc.value.trim();
    this.submitting = true;
    this.methodsForEmail = [];
    let cred: auth.UserCredential;
    this.auth.fetchSignInMethodsForEmail(email)
      .then(results => {
        this.methodsForEmail = results;
        if (results.length === 0) {
          return Promise.reject({
            code: 'auth/user-not-found'
          });
        }
        if (results.indexOf('password') === -1) {
          return Promise.reject({
            code: 'ngx-firebase-auth/no-password',
          });
        }
        return this.auth.signInWithEmailAndPassword(email, this.passwordFc.value);
      })
      .then(result => {
        cred = result;
        return this.authService.setRemembered(this.rememberFc.value === true, email);
      })
      .then(() => {
        this.success.emit(cred);
      })
      .catch(error => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/user-not-found':
          case 'auth/user-disabled':
          case 'ngx-firebase-auth/no-password':
            NgxFirebaseAuthFormHelper.setErrorUntilChanged(this.emailFc, error.code);
            break;
          case 'auth/wrong-password':
            NgxFirebaseAuthFormHelper.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.error.emit(error);
            break;
        }
      });
  }

}
