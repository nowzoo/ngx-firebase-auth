import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import {
  INgxFirebaseAuthOobResult, NgxFirebaseAuthRoute
} from '../../shared';

import { OobResetPasswordComponent } from './oob-reset-password.component';

describe('OobResetPasswordComponent', () => {
  let component: OobResetPasswordComponent;
  let fixture: ComponentFixture<OobResetPasswordComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobResetPasswordComponent ],
      providers: [
        {provide: NgxFirebaseAuthService, useValue: {}},
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

  describe('getters', () => {
    it('should have authService', () => {
      expect(component.authService).toBeTruthy();
    });
  });

  describe('ngOnInit()', () => {
    let setRouteSpy;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
    });
    it('should set formId', () => {
      const result: any = {error: null};
      component.result = result;
      component.ngOnInit();
      expect(component.formId).toBeTruthy();
    });
    it('should set up the fg', () => {
      const result: any = {error: null};
      component.result = result;
      component.ngOnInit();
      expect(component.emailFc).toEqual(jasmine.any(FormControl));
      expect(component.emailFc.disabled).toBe(true);
      expect(component.passwordFc).toEqual(jasmine.any(FormControl));
      expect(component.fg).toEqual(jasmine.any(FormGroup));
      expect(component.fg.get('email')).toBe(component.emailFc);
      expect(component.fg.get('password')).toBe(component.passwordFc);
    });
    it('should set the route', () => {
      const result: any = {error: null};
      component.result = result;
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.resetPasswordCode);
    });
    it('should show error if result has an error', () => {
      const error: any = {code: 'foo'};
      const result: any = {error: error};
      component.result = result;
      component.ngOnInit();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    });
    it('should show form if result has no error', () => {
      const result: any = {error: null};
      component.result = result;
      component.ngOnInit();
      expect(component.screen).toBe('form');
      expect(component.error).toBe(null);
    });
  });

  describe('submit()', () => {
    let result: any;
    let apiSpy;
    beforeEach(() => {
      result = {code: 'oob', email: 'foo@bar.com'};
      component.result = result;
      component.passwordFc = new FormControl('password');
      apiSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({confirmPasswordReset: apiSpy});
    });
    it('should set submitting to true', () => {
      apiSpy.and.callFake(() => Promise.resolve());
      expect(component.submitting).toBe(false);
      component.submit();
      expect(component.submitting).toBe(true);
    });
    it('should show success if confirmPasswordReset succeeds', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve());
      component.submit();
      expect(apiSpy).toHaveBeenCalledWith(result.code, 'foo@bar.com', 'password');
      tick();
      expect(component.screen).toBe('success');
    }));
    it('should show error if the confirmPasswordReset call fails with unhandled error', fakeAsync(() => {
      const error = {code: 'foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(apiSpy).toHaveBeenCalledWith(result.code, 'foo@bar.com', 'password');
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
      expect(component.submitting).toBe(false);
    }));
    it('should handle auth/weak-password', fakeAsync(() => {
      const error = {code: 'auth/weak-password'};
      component.screen = 'form';
      apiSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(apiSpy).toHaveBeenCalledWith(result.code, 'foo@bar.com', 'password');
      tick();
      expect(component.screen).toBe('form');
      expect(component.error).not.toBe(error);
      expect(component.submitting).toBe(false);
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(true);
      component.passwordFc.setValue('');
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(false);
    }));
  });
});
