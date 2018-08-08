import { Component, OnInit, NgZone, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { auth } from 'firebase/app';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';

@Component({
  selector: 'ngx-firebase-auth-sign-up-password-form',
  templateUrl: './sign-up-password-form.component.html',
  styleUrls: ['./sign-up-password-form.component.css']
})
export class SignUpPasswordFormComponent implements OnInit {

  formId = 'ngx-firebase-auth-sign-up-password-form-';
  submitting = false;
  nameFc: FormControl;
  passwordFc: FormControl;
  fg: FormGroup;
  showInvalid = NgxFormUtils.showInvalid;

  @Input() email: string;
  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() error: EventEmitter<auth.Error> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
