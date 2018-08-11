import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl } from '@angular/forms';

import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute } from '@angular/router';

import { auth } from 'firebase/app';
import { NgxFirebaseAuthRoute } from '../shared';


import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
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

  it('should have formId', () => {
    expect(component.formId).toBeTruthy();
  });
  it('should have submitting', () => {
    expect(component.submitting).toBe(false);
  });
  it('should have unhandledError', () => {
    expect(component.unhandledError).toBe(null);
  });

  describe('reset()', () => {

    it('should set unhandledError to null', () => {
      component.unhandledError = {} as any;
      component.reset();
      expect(component.unhandledError).toBe(null);
    });
    it('should set submitting to false', () => {
      component.submitting = true;
      component.reset();
      expect(component.submitting).toBe(false);
    });
    it('should set screen to form', () => {
      component.screen = 'error';
      component.reset();
      expect(component.screen).toBe('form');
    });
  });


  describe('initFg()', () => {
    let validateEmailHasPasswordSpy;
    beforeEach(() => {
      validateEmailHasPasswordSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(null));
      spyOnProperty(component, 'authService').and.returnValue({
        emailHasPasswordValidator: validateEmailHasPasswordSpy
      });
      component.initFg();
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


});
