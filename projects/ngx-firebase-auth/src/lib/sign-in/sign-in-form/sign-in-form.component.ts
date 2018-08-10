import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { debounceTime } from 'rxjs/operators';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { EmailSignInMethodsResult } from '../../shared';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';

@Component({
  selector: 'ngx-firebase-auth-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.css']
})
export class SignInFormComponent implements OnInit, AfterViewInit {
  @ViewChild('passwordInput') passwordInputRef: ElementRef;

  @Input() methodsForEmail: EmailSignInMethodsResult;

  @Output() reset: EventEmitter<string> = new EventEmitter();
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() unhandledError: EventEmitter<auth.Error> = new EventEmitter();

  showInvalid = NgxFormUtils.showInvalid;

  formId = 'ngx-firebase-auth-sign-in-form-';
  submitting = false;
  emailFc: FormControl;
  passwordFc: FormControl;
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

  get emailHasPassword(): boolean {
    return this.methodsForEmail.methods.indexOf('password') !== -1;
  }

  get emailOAuthMethods(): string[] {
    return this.methodsForEmail.methods.filter(id => 'password' !== id);
  }

  ngOnInit() {
    this.emailFc = new FormControl(this.methodsForEmail.email);
    this.emailFc.disable();
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.fg = new FormGroup({
      email: this.emailFc,
      password: this.passwordFc
    });
  }

  ngAfterViewInit() {
    if (this.passwordInputRef) {
      this.passwordInputRef.nativeElement.focus();
    }

  }
  submit() {
    this.submitting = true;
    this.auth.signInWithEmailAndPassword(this.methodsForEmail.email, this.passwordFc.value)
      .then((cred: auth.UserCredential) => {
        this.success.emit(cred);
        this.submitting = false;
      })
      .catch((error: auth.Error) => {
        switch (error.code) {
          case 'auth/wrong-password':
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
