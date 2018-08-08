import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl } from '@angular/forms';

import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute } from '@angular/router';
import { auth } from 'firebase/app';
import {  NgxFirebaseAuthRoute } from '../shared';

import { OobResetPasswordComponent } from './oob-reset-password.component';

describe('OobResetPasswordComponent', () => {
  let component: OobResetPasswordComponent;
  let fixture: ComponentFixture<OobResetPasswordComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobResetPasswordComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
      ]
    })
    .overrideTemplate(OobResetPasswordComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(OobResetPasswordComponent);
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

  describe('initFg()', () => {
    it('should set up the form', () => {
      component.initFg();
      expect(component.emailFc).toEqual(jasmine.any(FormControl));
      expect(component.passwordFc).toEqual(jasmine.any(FormControl));
      expect(component.rememberFc).toEqual(jasmine.any(FormControl));
      expect(component.fg).toEqual(jasmine.any(FormGroup));
      expect(component.fg.get('email')).toBe(component.emailFc);
      expect(component.fg.get('password')).toBe(component.passwordFc);
      expect(component.fg.get('remember')).toBe(component.rememberFc);
    });
    it('should disable the email', () => {
      component.initFg();
      expect(component.emailFc.disabled).toBe(true);
    });
  });

  describe('ngOnInit()', () => {
    let oobCode;
    let setRouteSpy;
    let actionCodeInfo;
    let checkActionCodeSpy;
    let initFgSpy;
    beforeEach(() => {
      initFgSpy = spyOn(component, 'initFg').and.callFake(() => {});
      oobCode = 'oob-code';
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: oobCode});
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
      actionCodeInfo = {data: {email: 'foo@bar.com'}};
      checkActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(actionCodeInfo));
      spyOnProperty(component, 'auth').and.returnValue({
        checkActionCode: checkActionCodeSpy
      });
    });
    it('should set route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.oobResetPassword);
    });
    it('should set up the form', () => {
      component.ngOnInit();
      expect(initFgSpy).toHaveBeenCalledWith();
    });
    it('should call auth.verifyPasswordResetCode', () => {
      component.ngOnInit();
      expect(checkActionCodeSpy).toHaveBeenCalledWith(oobCode);
    });
    it('should set screen to form if verifyPasswordResetCode succeeds', fakeAsync(() => {
      component.emailFc = new FormControl();
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('form');
      expect(component.emailFc.value).toBe(actionCodeInfo.data.email);
    }));
    it('should set screen to error if verifyPasswordResetCode fails', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      checkActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));
  });

  describe('submit()', () => {
    let oobCode;
    let cred;
    let confirmPasswordResetSpy;
    let signInWithEmailAndPasswordSpy;
    let setPersistenceSpy;
    let pushActionCodeSuccessSpy;
    beforeEach(() => {
      oobCode = 'oob-code';
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: oobCode});
      cred = {user: {}};
      confirmPasswordResetSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      signInWithEmailAndPasswordSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      setPersistenceSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        confirmPasswordReset: confirmPasswordResetSpy,
        signInWithEmailAndPassword: signInWithEmailAndPasswordSpy,
        setPersistence: setPersistenceSpy
      });
      pushActionCodeSuccessSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({
        pushActionCodeSuccess: pushActionCodeSuccessSpy,
      });
      component.initFg();
      component.fg.setValue({
        email: 'foo@bar.com',
        password: 'password',
        remember: true
      });
      component.screen = 'form';
      component.actionCodeInfo = {} as any;
    });

    it('should handle success', fakeAsync(() => {
      component.submitting = false;
      component.screen = 'form';
      component.unhandledError = {} as any;
      component.submit();
      expect(component.submitting).toBe(true);
      expect(confirmPasswordResetSpy).toHaveBeenCalledWith(oobCode, 'password');
      expect(component.unhandledError).toBe(null);
      expect(component.screen).toBe('form');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.cred).toBe(cred);
      expect(pushActionCodeSuccessSpy).toHaveBeenCalledWith(component.actionCodeInfo);
      expect(component.screen).toBe('success');
      expect(component.unhandledError).toBe(null);
    }));

    it('should handle auth/weak-password error', fakeAsync(() => {
      const error = {code: 'auth/weak-password'};
      confirmPasswordResetSpy.and.callFake(() => Promise.reject(error));
      component.submitting = false;
      component.screen = 'form';
      component.unhandledError = {} as any;
      component.submit();
      expect(component.submitting).toBe(true);
      expect(confirmPasswordResetSpy).toHaveBeenCalledWith(oobCode, 'password');
      expect(component.unhandledError).toBe(null);
      expect(component.screen).toBe('form');
      tick();
      expect(component.submitting).toBe(false);
      expect(pushActionCodeSuccessSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('form');
      expect(component.unhandledError).toBe(null);
      expect(component.passwordFc.hasError(error.code)).toBe(true);
      component.passwordFc.setValue('');
      expect(component.passwordFc.hasError(error.code)).toBe(false);
    }));
    it('should handle an unknown  error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      confirmPasswordResetSpy.and.callFake(() => Promise.reject(error));
      component.screen = 'form';
      component.submitting = false;
      component.unhandledError = {} as any;
      component.submit();
      expect(confirmPasswordResetSpy).toHaveBeenCalledWith(oobCode, 'password');
      expect(component.unhandledError).toBe(null);
      expect(component.screen).toBe('form');
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
      expect(pushActionCodeSuccessSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));


    it('should set submitting to true', () => {
      component.submitting = false;
      component.submit();
      expect(component.submitting).toBe(true);
    });

    it('should call setPersistence if remember is true', fakeAsync(() => {
      component.rememberFc.setValue(true);
      component.submit();
      tick();
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.LOCAL);
      expect(component.screen).toBe('success');
    }));
    it('should call setPersistence if remember is false', fakeAsync(() => {
      component.rememberFc.setValue(false);
      component.submit();
      tick();
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.SESSION);
      expect(component.screen).toBe('success');
    }));

  });
});
