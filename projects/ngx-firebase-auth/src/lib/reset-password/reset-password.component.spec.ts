import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl } from '@angular/forms';

import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  ngxFirebaseAuthRouteSlugs,
  NGX_FIREBASE_AUTH_OPTIONS
} from '../shared';


import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordComponent ],
      providers: [
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(ResetPasswordComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(ResetPasswordComponent);
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
  it('should have route', () => {
    expect(component.route).toBeTruthy();
  });
  it('should have queryParams', () => {
    expect(component.queryParams).toBeTruthy();
  });
  it('should have router', () => {
    expect(component.router).toBeTruthy();
  });
  it('should have formId', () => {
    expect(component.formId).toBeTruthy();
  });
  it('should have submitting', () => {
    expect(component.submitting).toBe(false);
  });
  it('should have unhandledError', () => {
    expect(component.unhandledError).toBe(null);
  });

  it('should have signInMethodsForEmail', () => {
    expect(component.signInMethodsForEmail).toBe(null);
    component.signInMethodsForEmail = ['twitter.com'];
    expect(component.signInMethodsForEmail).toEqual(['twitter.com']);
  });

  it('should have emailHasPasswordMethod', () => {
    expect(component.emailHasPasswordMethod).toBe(false);
    component.signInMethodsForEmail = ['twitter.com'];
    expect(component.emailHasPasswordMethod).toBe(false);
    component.signInMethodsForEmail = ['twitter.com', 'password'];
    expect(component.emailHasPasswordMethod).toBe(true);
  });
  it('should have emailOAuthMethods', () => {
    expect(component.emailOAuthMethods).toEqual([]);
    component.signInMethodsForEmail = ['twitter.com'];
    expect(component.emailOAuthMethods).toEqual(['twitter.com']);
    component.signInMethodsForEmail = ['twitter.com', 'password'];
    expect(component.emailOAuthMethods).toEqual(['twitter.com']);
    component.signInMethodsForEmail = ['twitter.com', 'password', 'facebook.com'];
    expect(component.emailOAuthMethods).toEqual(['twitter.com', 'facebook.com']);
    component.signInMethodsForEmail = [ 'password'];
    expect(component.emailOAuthMethods).toEqual([]);
  });

  describe('initFg()', () => {
    beforeEach(() => {
      component.initFg();
      spyOn(component, 'validateEmail').and.callFake(() => Promise.resolve(null));
    });
    it('should set emailFc', () => {
      expect(component.emailFc).toEqual(jasmine.any(FormControl));
    });
    it('should set the value of emailFc to the email queryParam, if present', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({email: 'foo@bar.com'});
      component.initFg();
      expect(component.emailFc.value).toBe('foo@bar.com');
    });
    it('should set the value of emailFc to empty string, if the query param is not present', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({});
      expect(component.emailFc.value).toBe('');
    });
    it('should set up the form group', () => {
      expect(component.fg).toEqual(jasmine.any(FormGroup));
      expect(component.fg.get('email')).toBe(component.emailFc);
    });
  });
  describe('ngOnInit', () => {
    let setRouteSpy;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
      spyOn(component, 'initFg').and.callFake(() => {});
    });
    it('should set route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.resetPassword);
    });
    it('should call initFg', () => {
      component.ngOnInit();
      expect(component.initFg).toHaveBeenCalledWith();
    });
  });

  describe('submit', () => {
    let sendPasswordResetEmailSpy;
    beforeEach(() => {
      sendPasswordResetEmailSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({sendPasswordResetEmail: sendPasswordResetEmailSpy});
      component.emailFc = new FormControl('foo@bar.com');
    });
    it('should set submitting to true', () => {
      component.submitting = false;
      component.submit();
      expect(component.submitting).toBe(true);
    });
    it('should set unhandledError to null', () => {
      component.unhandledError = {} as any;
      component.submit();
      expect(component.unhandledError).toBe(null);
    });
    it('should call sendPasswordResetEmail', () => {
      component.submit();
      expect(sendPasswordResetEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    });
    it('should resolve and set the screen to "succeess"', fakeAsync(() => {
      component.submit();
      tick();
      expect(component.screen).toBe('success');
    }));
    it('should resolve and set submitting to false', fakeAsync(() => {
      component.submit();
      tick();
      expect(component.submitting).toBe(false);
    }));
    it('should set unhandledError on failure', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      sendPasswordResetEmailSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(component.unhandledError).toBe(null);
      tick();
      expect(component.unhandledError).toBe(error);
    }));
    it('should set submitting to false on failure', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      sendPasswordResetEmailSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.submitting).toBe(false);
    }));

  });

  describe('validateEmail', () => {
    let emailFc: FormControl;
    let fetchSignInMethodsForEmailSpy;
    let validateSpy;
    beforeEach(() => {
      validateSpy = spyOn(component, 'validateEmail').and.callThrough();
      fetchSignInMethodsForEmailSpy = jasmine.createSpy();
      emailFc = new FormControl('', {
        asyncValidators: [component.validateEmail.bind(component)]
      });
      spyOnProperty(component, 'auth').and.returnValue({
        fetchSignInMethodsForEmail: fetchSignInMethodsForEmailSpy
      });
    });
    it('should be required error if control is empty', fakeAsync(() => {
      emailFc.setValue('');
      tick();
      expect(emailFc.errors).toEqual({required: true});
      expect(component.signInMethodsForEmail).toEqual([]);
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
    }));
    it('should be email error if control is not an email', fakeAsync(() => {
      emailFc.setValue('foo');
      tick();
      expect(emailFc.errors).toEqual({email: true});
      expect(component.signInMethodsForEmail).toEqual([]);
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
    }));
    it('should be error ngx-firebase-auth/user-not-found if the methods are empty', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve([]));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual({'ngx-firebase-auth/user-not-found': true});
      expect(component.signInMethodsForEmail).toEqual([]);
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    }));
    it('should be error ngx-firebase-auth/no-password if the methods do not have password', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['twitter.com']));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(component.signInMethodsForEmail).toEqual(['twitter.com']);
      expect(emailFc.errors).toEqual({'ngx-firebase-auth/no-password': true});
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    }));
    it('should be null if the methods has password', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['twitter.com', 'password']));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual(null);
      expect(component.signInMethodsForEmail).toEqual(['twitter.com', 'password']);
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    }));
    it('should be whatever code the api call rejects with', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.reject({code: 'auth/invalid-email'}));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(component.signInMethodsForEmail).toEqual([]);
      expect(emailFc.errors).toEqual({'auth/invalid-email': true});
    }));
  });
});
