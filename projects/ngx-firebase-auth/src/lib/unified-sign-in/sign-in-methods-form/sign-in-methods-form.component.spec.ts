import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS
} from '../../shared';


import { SignInMethodsFormComponent } from './sign-in-methods-form.component';

describe('SignInMethodsFormComponent', () => {
  let component: SignInMethodsFormComponent;
  let fixture: ComponentFixture<SignInMethodsFormComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInMethodsFormComponent ],
      providers: [
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(SignInMethodsFormComponent, '');
    fixture = TestBed.createComponent(SignInMethodsFormComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
