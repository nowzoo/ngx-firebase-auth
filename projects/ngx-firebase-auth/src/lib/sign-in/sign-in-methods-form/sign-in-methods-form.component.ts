import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { debounceTime } from 'rxjs/operators';
import { ISignInMethodsForEmailResult, getOAuthProviderIcon, getOAuthProviderName } from '../../shared';
import { NgxFirebaseAuthFormHelper } from '../../form-helper';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { fadeInOutAnimation, screenAnimation } from '../../shared';

@Component({
  selector: 'ngx-firebase-auth-sign-in-methods-form',
  templateUrl: './sign-in-methods-form.component.html',
  styleUrls: ['./sign-in-methods-form.component.scss'],
  animations: [fadeInOutAnimation, screenAnimation]
})
export class SignInMethodsFormComponent implements OnInit, AfterViewInit {


  @ViewChild('emailInput') emailInput: ElementRef;
  @Input() email: string;
  @Input() remember: boolean;
  @Input() oAuthProviderIds: string[] = [];
  @Output() emailChange: EventEmitter<string> = new EventEmitter();
  @Output() rememberChange: EventEmitter<boolean> = new EventEmitter();
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();


  formId = 'ngx-firebase-auth-sign-in-methods-form-';
  submitting = false;
  fg: FormGroup;
  emailFc: FormControl;
  rememberFc: FormControl;
  getOAuthProviderIcon = getOAuthProviderIcon;
  getOAuthProviderName = getOAuthProviderName;
  methodsForEmail: ISignInMethodsForEmailResult = {status: 'unfetched', methods: [], email: null};

  constructor(
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _ngZone: NgZone
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }
  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }


  get methods(): string[] {
    return this.methodsForEmail.methods;
  }

  get fetchStatus(): string {
    return this.methodsForEmail.status;
  }

  get methodsFetched(): boolean {
    return this.methodsForEmail.status === 'fetched';
  }

  get accountIsNew(): boolean {
    return this.methodsFetched && this.methods.length === 0;
  }

  get accountExists(): boolean {
    return this.methodsFetched && this.methods.length > 0;
  }

  get accountHasPassword(): boolean {
    return this.accountExists && this.methods.indexOf('password') !== -1;
  }

  get accountOAuthMethods(): string[] {
    if (! this.accountExists) {
      return [];
    }
    return this.methods.filter(id => id !== 'password');
  }




  ngOnInit() {
    this.emailFc = new FormControl(
      this.email,
      {validators: [Validators.required, Validators.email]}
    );
    this.rememberFc = new FormControl(this.remember);
    this.rememberFc.valueChanges.subscribe(() => this.rememberChange.emit(this.rememberFc.value));
    this.fg = new FormGroup({email: this.emailFc, remember: this.rememberFc});
    this.emailFc.valueChanges.subscribe(() => this.emailChange.emit(this.emailFc.value.trim()));
    this.emailFc.valueChanges.pipe(debounceTime(500)).subscribe(() => this.fetch());
    this.fetch();
  }

  ngAfterViewInit() {
    this.emailInput.nativeElement.focus();

  }


  fetch() {
    const email = this.emailFc.value.trim();
    if (email === this.methodsForEmail.email) {
      return;
    }
    if ('fetching' === this.methodsForEmail.status) {
      return;
    }
    this.methodsForEmail = {status: 'fetching', methods: [], email: email};
    if (this.emailFc.invalid) {
      this.methodsForEmail = {status: 'unfetched', methods: [], email: email};
      return;
    }
    this.auth.fetchSignInMethodsForEmail(email)
      .then(results => {
        this.methodsForEmail = {status: 'fetched', methods: results, email: email};
      })
      .catch((error: auth.Error) => {
        switch (error.code) {
          case 'auth/invalid-email':
            NgxFirebaseAuthFormHelper.setErrorUntilChanged(this.emailFc, error.code);
            break;
        }
        this.methodsForEmail = {email: this.email, status: 'unfetched', methods: []};
      });
  }

}
