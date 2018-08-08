import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS
} from '../shared';


import { UnifiedSignInComponent } from './unified-sign-in.component';

describe('UnifiedSignInComponent', () => {
  let component: UnifiedSignInComponent;
  let fixture: ComponentFixture<UnifiedSignInComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ UnifiedSignInComponent ],
      providers: [
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(UnifiedSignInComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(UnifiedSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
