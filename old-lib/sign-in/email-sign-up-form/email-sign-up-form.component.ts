import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { auth } from 'firebase/app';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';

@Component({
  selector: 'ngx-firebase-auth-email-sign-up-form',
  templateUrl: './email-sign-up-form.component.html',
  styleUrls: ['./email-sign-up-form.component.css']
})
export class EmailSignUpFormComponent implements OnInit {

  @Input() email: string;
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() busy: EventEmitter<boolean> = new EventEmitter();
  @Output() unhandledError: EventEmitter<auth.Error> = new EventEmitter();

  private _submitting = false;
  formId: string;
  passwordFc: FormControl;
  nameFc: FormControl;
  fg: FormGroup;

  constructor(
    private _authService: NgxFirebaseAuthService
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  get submitting(): boolean {
    return this._submitting;
  }
  set submitting(b: boolean) {
    this._submitting = b;
    this.busy.emit(b);
  }

  ngOnInit() {
    this.formId = NgxFirebaseAuthService.uniqueId();
    this.passwordFc = new FormControl('', {validators: [Validators.required]});
    this.nameFc = new FormControl('', {validators: [Validators.required, NgxFormValidators.requiredString]});
    this.fg = new FormGroup({password: this.passwordFc, name: this.nameFc});
    this.busy.emit(false);
  }

  submit() {
    this.submitting = true;
    this.authService.createUserWithPassword(this.email, this.passwordFc.value, this.nameFc.value.trim())
      .then((cred: auth.UserCredential) => {
        this.submitting = false;
        this.success.emit(cred);
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/weak-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.unhandledError.emit(error);
            break;
        }
      });
  }

}
