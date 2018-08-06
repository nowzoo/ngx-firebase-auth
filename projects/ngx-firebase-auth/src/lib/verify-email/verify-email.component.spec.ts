import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import { Subject } from 'rxjs';

import {
  NgxFirebaseAuthRoute, NGX_FIREBASE_AUTH_OPTIONS
} from '../shared';

import { VerifyEmailComponent } from './verify-email.component';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyEmailComponent ],
      providers: [
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}, authState: new Subject()}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(VerifyEmailComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should have auth', () => {
    expect(component.auth).toBeTruthy();
  });
  it('should have authService', () => {
    expect(component.authService).toBeTruthy();
  });
  it('should have authState', () => {
    expect(component.authState).toBeTruthy();
  });
  it('should have route', () => {
    expect(component.route).toBeTruthy();
  });
  it('should have router', () => {
    expect(component.router).toBeTruthy();
  });
  it('should have queryParams', () => {
    expect(component.queryParams).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    let setRouteSpy;
    let submitSpy;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
      submitSpy = spyOn(component, 'submit').and.callFake(() => {});
    });
    it('should set the route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.verifyEmail);
    });
    it('should call submit', () => {
      component.ngOnInit();
      expect(submitSpy).toHaveBeenCalled();
    });
  });

  describe('submit()', () => {
    let sendEmailVerificationSpy;
    let user;
    let authState$;
    let navigateSpy;
    let getIndexRouterLinkSpy;
    let getSignInRouterLinkSpy;
    beforeEach(() => {
      sendEmailVerificationSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      user = {sendEmailVerification: sendEmailVerificationSpy};
      authState$ = new Subject();
      navigateSpy = jasmine.createSpy();
      getIndexRouterLinkSpy =
      spyOnProperty(component, 'authState').and.returnValue(authState$.asObservable());
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
      getIndexRouterLinkSpy = jasmine.createSpy().and.callFake(() => ['/', 'auth']);
      getSignInRouterLinkSpy = jasmine.createSpy().and.callFake(() => ['/', 'auth', 'sign-in']);
      spyOnProperty(component, 'authService').and.returnValue({
        getIndexRouterLink: getIndexRouterLinkSpy,
        getSignInRouterLink: getSignInRouterLinkSpy
      });
    });
    it('should set screen to wait', () => {
      component.screen = 'success';
      component.submit();
      expect(component.screen).toBe('wait');
    });
    it('should set error to null', () => {
      component.error = {} as any;
      component.submit();
      expect(component.error).toBe(null);
    });
    it('should navigate if the user is not signed in', () => {
      component.submit();
      authState$.next(null);
      expect(navigateSpy).toHaveBeenCalledWith(getSignInRouterLinkSpy.calls.mostRecent().returnValue);
      expect(sendEmailVerificationSpy).not.toHaveBeenCalled();
    });
    it('should navigate if the user is verified', () => {
      user.emailVerified = true;
      component.submit();
      authState$.next(user);
      expect(navigateSpy).toHaveBeenCalledWith(getIndexRouterLinkSpy.calls.mostRecent().returnValue);
      expect(sendEmailVerificationSpy).not.toHaveBeenCalled();
    });
    it('should call user.sendEmailVerification', () => {
      user.emailVerified = false;
      component.submit();
      authState$.next(user);
      expect(component.screen).toBe('wait');
      expect(sendEmailVerificationSpy).toHaveBeenCalledWith();
    });
    it('should show success if the call succeeds', fakeAsync(() => {
      user.emailVerified = false;
      component.submit();
      authState$.next(user);
      expect(component.screen).toBe('wait');
      tick();
      expect(component.screen).toBe('success');
    }));
    it('should show an error', fakeAsync(() => {
      const error = {foo: true};
      sendEmailVerificationSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      authState$.next(user);
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));
  });
});
