import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { EmailSignInMethodsResult } from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-sign-in-methods-form',
  templateUrl: './sign-in-methods-form.component.html',
  styleUrls: ['./sign-in-methods-form.component.css']
})
export class SignInMethodsFormComponent implements OnInit, AfterViewInit {
  @ViewChild('emailInput') emailInputRef: ElementRef;
  @Input() email = '';
  @Output() success: EventEmitter<EmailSignInMethodsResult> = new EventEmitter();
  @Output() unhandledError: EventEmitter<auth.Error> = new EventEmitter();

  formId = 'ngx-firebase-auth-sign-in-methods-form-';
  emailFc: FormControl;
  fg: FormGroup;
  submitting = false;
  showInvalid = NgxFormUtils.showInvalid;

  constructor(
    private _afAuth: AngularFireAuth,
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  ngOnInit() {
    this.emailFc = new FormControl(
      this.email, { validators: [Validators.required, Validators.email] }
    );
    this.fg = new FormGroup({email: this.emailFc});
  }

  ngAfterViewInit() {
    this.emailInputRef.nativeElement.focus();
  }

  submit() {
    this.submitting = true;
    const email = this.emailFc.value.trim();
    this.auth.fetchSignInMethodsForEmail(email)
      .then((results: string[]) => {
        this.success.emit({email: email, methods: results});
        this.submitting = false;
      })
      .catch((error: auth.Error) => {
        switch (error.code) {
          case 'auth/invalid-email':
            NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
            break;
          default:
            this.unhandledError.emit(error);
            break;
        }
        this.submitting = false;
      });
  }



}
