import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { auth } from 'firebase/app';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';


@Component({
  selector: 'ngx-firebase-auth-email-sign-in-form',
  templateUrl: './email-sign-in-form.component.html',
  styleUrls: ['./email-sign-in-form.component.css']
})
export class EmailSignInFormComponent implements OnInit {
  @Input() email: string;
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() busy: EventEmitter<boolean> = new EventEmitter();
  @Output() unhandledError: EventEmitter<auth.Error> = new EventEmitter();

  private _submitting = false;
  formId: string;
  passwordFc: FormControl;
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
    this.passwordFc = new FormControl('', {validators: Validators.required});
    this.fg = new FormGroup({password: this.passwordFc});
    this.busy.emit(false);
  }

  submit() {
    this.submitting = true;
    this.authService.signInWithPassword(this.email, this.passwordFc.value)
      .then((cred: auth.UserCredential) => {
        this.submitting = false;
        this.success.emit(cred);
      })
      .catch((error: auth.Error) => {
        this.submitting = false;
        switch (error.code) {
          case 'auth/wrong-password':
            NgxFormUtils.setErrorUntilChanged(this.passwordFc, error.code);
            break;
          default:
            this.unhandledError.emit(error);
            break;
        }
      });
  }

}
