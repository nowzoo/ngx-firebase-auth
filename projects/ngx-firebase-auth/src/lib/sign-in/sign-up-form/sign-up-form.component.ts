import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import { EmailSignInMethodsResult } from '../../shared';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
@Component({
  selector: 'ngx-firebase-auth-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.css']
})
export class SignUpFormComponent implements OnInit, AfterViewInit {
  @ViewChild('passwordInput') passwordInputRef: ElementRef;

  @Input() methodsForEmail: EmailSignInMethodsResult;

  @Output() reset: EventEmitter<string> = new EventEmitter();
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() unhandledError: EventEmitter<auth.Error> = new EventEmitter();

  showInvalid = NgxFormUtils.showInvalid;

  formId = 'ngx-firebase-auth-sign-up-form-';
  submitting = false;
  emailFc: FormControl;
  passwordFc: FormControl;
  nameFc: FormControl;
  fg: FormGroup;

  constructor(
    private _authService: NgxFirebaseAuthService,
    private _afAuth: AngularFireAuth
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {
    this.emailFc = new FormControl(this.methodsForEmail.email);
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.nameFc = new FormControl('', {validators: [Validators.required, NgxFormValidators.requiredString]});
    this.fg = new FormGroup({
      email: this.emailFc,
      password: this.passwordFc,
      name: this.nameFc
    });
  }
  ngAfterViewInit() {
    if (this.passwordInputRef) {
      this.passwordInputRef.nativeElement.focus();
    }

  }
  submit() {
    let cred: auth.UserCredential;
    this.submitting = true;
    this.auth.createUserWithEmailAndPassword(this.methodsForEmail.email, this.passwordFc.value)
      .then((result: auth.UserCredential) => {
        cred = result;
        return cred.user.updateProfile({displayName: this.nameFc.value.trim(), photoURL: null});
      })
      .then(() => {
        this.success.emit(cred);
        this.submitting = false;
      })
      .catch((error: auth.Error) => {
        switch (error.code) {
          case 'auth/weak-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.unhandledError.emit(error);
            break;
        }
        this.submitting = false;
      });
  }

}
