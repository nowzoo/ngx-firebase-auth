import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl } from '@angular/forms';

import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS
} from '../shared';

import { OobResetPasswordComponent } from './oob-reset-password.component';

describe('OobResetPasswordComponent', () => {
  let component: OobResetPasswordComponent;
  let fixture: ComponentFixture<OobResetPasswordComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobResetPasswordComponent ],
      providers: [
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
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

  it('should have router', () => {
    expect(component.router).toBeTruthy();
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
    let navigateSpy;
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
      navigateSpy = jasmine.createSpy();
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
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
      expect(component.error).toBe(error);
    }));
  });

  describe('submit()', () => {
    let oobCode;
    let cred;
    let confirmPasswordResetSpy;
    let signInWithEmailAndPasswordSpy;
    let setPersistenceSpy;
    let pushActionCodeSuccessSpy;
    let navigateSpy;
    let getIndexRouterLinkSpy;
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
      getIndexRouterLinkSpy = jasmine.createSpy().and.returnValue(['/', 'auth']);
      spyOnProperty(component, 'authService').and.returnValue({
        pushActionCodeSuccess: pushActionCodeSuccessSpy,
        getIndexRouterLink: getIndexRouterLinkSpy
      });
      navigateSpy = jasmine.createSpy();
      spyOnProperty(component, 'router').and.returnValue({
        navigate: navigateSpy
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
    it('should set submitting to true', () => {
      component.submitting = false;
      component.submit();
      expect(component.submitting).toBe(true);
    });
    it('should set error to null', () => {
      component.error = {} as any;
      component.submit();
      expect(component.error).toBe(null);
    });
    it('should call confirmPasswordReset', fakeAsync(() => {
      component.submit();
      expect(confirmPasswordResetSpy).toHaveBeenCalledWith(oobCode, 'password');
      tick();
      expect(component.screen).toBe(null);
    }));
    it('should handle confirmPasswordReset error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      confirmPasswordResetSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(confirmPasswordResetSpy).toHaveBeenCalledWith(oobCode, 'password');
      tick();
      expect(component.screen).toBe('error');
    }));
    it('should call signInWithEmailAndPassword', fakeAsync(() => {
      component.submit();
      tick();
      expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(component.screen).toBe(null);
    }));
    it('should handle signInWithEmailAndPassword error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      signInWithEmailAndPasswordSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(component.screen).toBe('error');
    }));
    it('should call setPersistence if remember is true', fakeAsync(() => {
      component.rememberFc.setValue(true);
      component.submit();
      tick();
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.LOCAL);
      expect(component.screen).toBe(null);
    }));
    it('should call setPersistence if remember is false', fakeAsync(() => {
      component.rememberFc.setValue(false);
      component.submit();
      tick();
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.SESSION);
      expect(component.screen).toBe(null);
    }));
    it('should handle setPersistence error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      setPersistenceSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.LOCAL);
      expect(component.screen).toBe('error');
    }));
    it('should call pushActionCodeSuccess with the cred', fakeAsync(() => {
      component.submit();
      tick();
      expect(pushActionCodeSuccessSpy).toHaveBeenCalledWith(component.actionCodeInfo);
    }));
    it('should set component.cred', fakeAsync(() => {
      component.submit();
      tick();
      expect(component.cred).toBe(cred);
    }));
    it('should handle auth/weak-password error', fakeAsync(() => {
      const error = {code: 'auth/weak-password'};
      confirmPasswordResetSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.passwordFc.hasError(error.code)).toBe(true);
      expect(component.screen).toBe('form');
      expect(component.error).toBe(null);
      component.passwordFc.setValue('');
      expect(component.passwordFc.hasError(error.code)).toBe(false);

    }));
    it('should handle auth/foo error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      confirmPasswordResetSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));
  });
});
