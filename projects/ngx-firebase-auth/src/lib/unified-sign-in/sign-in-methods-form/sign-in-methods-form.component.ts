import { Component, OnInit, NgZone, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { auth } from 'firebase/app';
import { take, debounceTime } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS,
  INgxFirebaseAuthOptions,
  INgxFirebaseAuthMethodsForEmailResult
} from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-sign-in-methods-form',
  templateUrl: './sign-in-methods-form.component.html',
  styleUrls: ['./sign-in-methods-form.component.css']
})
export class SignInMethodsFormComponent implements OnInit {

  formId = 'ngx-firebase-auth-sign-in-email-form-';
  submitting = false;
  emailFc: FormControl;
  fg: FormGroup;
  showInvalid = NgxFormUtils.showInvalid;
  private _methodsForEmailResult: INgxFirebaseAuthMethodsForEmailResult = null;
  @Input() email: string;
  @Output() success: EventEmitter<INgxFirebaseAuthMethodsForEmailResult> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();

  constructor(
    @Inject(NGX_FIREBASE_AUTH_OPTIONS) private _options: INgxFirebaseAuthOptions,
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _ngZone: NgZone
  ) { }

  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }



  ngOnInit() {
    this.emailFc = new FormControl(
      this.email || '',
      {validators: [Validators.required, Validators.email]}
    );
    this.fg = new FormGroup({email: this.emailFc});
  }

  submit() {
    const email = this.emailFc.value.trim();
    this.submitting = true;
    this._ngZone.runOutsideAngular(() => {
      this.auth.fetchSignInMethodsForEmail(email)
        .then((methods: string[]) => {
          this._ngZone.run(() => {
            this.submitting = false;
            this.success.emit({email: email, methods: methods});
          });
        })
        .catch((error: auth.Error) => {
          this._ngZone.run(() => {
            this.submitting = false;
            switch (error.code) {
              case 'auth/invalid-email':
                NgxFormUtils.setErrorUntilChanged(this.emailFc, error.code);
                break;
              default:
                this.error.emit(error);
                break;
            }
          });
        });
    });
  }

}
