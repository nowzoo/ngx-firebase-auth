import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { debounceTime } from 'rxjs/operators';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { EmailSignInMethodsResult } from '../interfaces';
@Component({
  selector: 'ngx-firebase-auth-email-sign-in-methods-form',
  templateUrl: './email-sign-in-methods-form.component.html',
  styleUrls: ['./email-sign-in-methods-form.component.css']
})
export class EmailSignInMethodsFormComponent implements OnInit {

  static debounce = 1000;
  @Input() email = '';
  @Output() result: EventEmitter<EmailSignInMethodsResult> = new EventEmitter();

  formId = 'ngx-firebase-auth-email-sign-in-methods-form-';
  emailFc: FormControl;
  showInvalid = NgxFormUtils.showInvalid;

  constructor(
    private _afAuth: AngularFireAuth,
    private _ngZone: NgZone
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  ngOnInit() {
    this.emailFc = new FormControl(
      this.email, { validators: [Validators.required, Validators.email] }
    );
    this.emailFc.valueChanges
      .pipe(debounceTime(EmailSignInMethodsFormComponent.debounce))
      .subscribe(() => this.fetch());
    this.fetch();
  }

  fetch() {
    const email = this.emailFc.value.trim();
    this.result.emit({fetched: false, email: email, methods: []});
    if (this.emailFc.invalid) {
      return;
    }
    this._ngZone.runOutsideAngular(() => {
      this.auth.fetchSignInMethodsForEmail(email)
        .then((results: string[]) => {
          this._ngZone.run(() => {
            this.result.emit({fetched: true, email: email, methods: results});
          });
        })
        .catch((error: auth.Error) => {
          this._ngZone.run(() => {
            NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
          });
        });
    });
  }
}
