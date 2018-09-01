import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';

import { fadeInOutAnimation } from '../../shared';
import { NgxFirebaseAuthFormHelper } from '../../form-helper';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
@Component({
  selector: 'ngx-firebase-auth-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.scss'],
  animations: [ fadeInOutAnimation ]
})
export class SignUpFormComponent implements OnInit, AfterViewInit {

  @ViewChild('passwordInput') passwordInput: ElementRef;
  @Input() email: string;
  @Input() remember: boolean;
  @Output() rememberChange: EventEmitter<boolean> = new EventEmitter();
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();

  formId = 'ngx-firebase-auth-sign-up-form-';
  submitting = false;
  fg: FormGroup;
  emailFc: FormControl;
  passwordFc: FormControl;
  nameFc: FormControl;
  rememberFc: FormControl;
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
    this.nameFc = new FormControl('', {validators: [Validators.required, NgxFirebaseAuthFormHelper.requiredNonEmpty]});
    this.rememberFc = new FormControl(this.remember);
    this.rememberFc.valueChanges.subscribe(val => this.rememberChange.emit(val));
    this.fg = new FormGroup({
      email: this.emailFc,
      password: this.passwordFc,
      name: this.nameFc,
      remember: this.rememberFc
    });
  }
  ngAfterViewInit() {
    this.passwordInput.nativeElement.focus();
  }

  submit() {

    this.submitting = true;
    let cred: auth.UserCredential;
    this.auth.fetchSignInMethodsForEmail(this.email)
      .then((results) => {
        if (results.length > 0) {
          return Promise.reject({
            code: 'ngx-firebase-auth/account-exists'
          });
        }
        return this.auth.createUserWithEmailAndPassword(this.email, this.passwordFc.value);
      })
      .then(result => {
        cred = result;
        return cred.user.updateProfile({displayName: this.nameFc.value.trim(), photoURL: null});
      })
      .then(() => {
        return this.authService.setRemembered(this.rememberFc.value === true, this.email);
      })
      .then(() => {
        this.success.emit(cred);
      })
      .catch(error => {
        this.submitting = false;
        this.emailFc.markAsDirty();
        this.emailFc.markAsTouched();
        this.passwordFc.markAsDirty();
        this.passwordFc.markAsTouched();
        switch (error.code) {
          case 'auth/invalid-email':
          case 'ngx-firebase-auth/account-exists':
            NgxFirebaseAuthFormHelper.setErrorUntilChanged(this.emailFc, error.code);
            break;
          case 'auth/weak-password':
            NgxFirebaseAuthFormHelper.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.error.emit(error);
            break;
        }
      });
  }

}
