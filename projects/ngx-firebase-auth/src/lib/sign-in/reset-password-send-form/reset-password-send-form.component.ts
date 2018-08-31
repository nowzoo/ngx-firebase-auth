import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { NgxFirebaseAuthFormHelper } from '../../form-helper';
import { fadeInOutAnimation } from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-reset-password-send-form',
  templateUrl: './reset-password-send-form.component.html',
  styleUrls: ['./reset-password-send-form.component.scss'],
  animations: [fadeInOutAnimation]
})
export class ResetPasswordSendFormComponent implements OnInit, AfterViewInit {

  @ViewChild('emailInput') emailInput: ElementRef;
  @Input() email: string;
  @Output() emailChange: EventEmitter<string> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();

  formId = 'ngx-firebase-auth-reset-password-send-form-';
  fg: FormGroup;
  emailFc: FormControl;
  submitting = false;
  sent: string = null;
  constructor(
    private _afAuth: AngularFireAuth,
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }





  ngOnInit() {
    this.emailFc = new FormControl(
      this.email,
      {validators: [Validators.required, Validators.email]}
    );
    this.emailFc.valueChanges.subscribe(() => this.emailChange.emit(this.emailFc.value.trim()));
    this.fg = new FormGroup({email: this.emailFc});
  }

  ngAfterViewInit() {
    this.emailInput.nativeElement.focus();
  }


  submit() {
    const email = this.emailFc.value.trim();
    this.submitting = true;
    this.sent = null;
    this.auth.sendPasswordResetEmail(email)
      .then(() => {
        this.submitting = false;
        this.sent = email;
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        this.emailFc.markAsTouched();
        this.emailFc.markAsDirty();
        switch (error.code) {
          case 'auth/invalid-email':
          case 'auth/user-not-found':
            NgxFirebaseAuthFormHelper.setErrorUntilChanged(this.emailFc, error.code);
            break;
          default:
            this.error.emit(error);
            break;
        }
      });


  }
}
