import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFirebaseAuthRoute } from '../shared';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordComponent ],
      providers: [
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
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

  describe('getters', () => {
    it('should have authService', () => {
      expect(component.authService).toBeTruthy();
    });
    it('should have queryParams', () => {
      expect(component.queryParams).toBeTruthy();
    });
  });

  describe('ngOnInit()', () => {
    let setRouteSpy;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({
        setRoute: setRouteSpy
      });
    });
    it('should set the route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.resetPasswordSend);
    });
    it('should set formId', () => {
      component.ngOnInit();
      expect(component.formId).toBeTruthy();
    });
    it('should set up the form', () => {
      component.ngOnInit();
      expect(component.fg.get('email')).toBe(component.emailFc);
    });
  });

  describe('submit()', () => {
    let email;
    let apiSpy;
    beforeEach(() => {
      email = 'foo@bar.com';
      component.emailFc = new FormControl(email);
      apiSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'authService').and.returnValue({sendPasswordResetEmail: apiSpy});
    });
    it('should handle success', fakeAsync(() => {
      component.submit();
      expect(component.submitting).toBe(true);
      expect(apiSpy).toHaveBeenCalledWith(email);
      tick();
      expect(component.submitting).toBe(false);
      expect(component.screen).toBe('success');
    }));
    it('should handle auth/invalid-email error', fakeAsync(() => {
      const error = {code: 'auth/invalid-email'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(component.submitting).toBe(true);
      expect(apiSpy).toHaveBeenCalledWith(email);
      tick();
      expect(component.submitting).toBe(false);
      expect(component.screen).toBe('form');
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(true);
      component.emailFc.setValue('');
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(false);
    }));
    it('should handle auth/user-not-found error', fakeAsync(() => {
      const error = {code: 'auth/user-not-found'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(component.submitting).toBe(true);
      expect(apiSpy).toHaveBeenCalledWith(email);
      tick();
      expect(component.submitting).toBe(false);
      expect(component.screen).toBe('form');
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(true);
      component.emailFc.setValue('');
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(false);
    }));
    it('should handle auth/unknown error', fakeAsync(() => {
      const error = {code: 'auth/unknown'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(component.submitting).toBe(true);
      expect(apiSpy).toHaveBeenCalledWith(email);
      tick();
      expect(component.submitting).toBe(false);
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(false);
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(false);
    }));
  });
});
