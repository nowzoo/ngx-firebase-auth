import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { EmailSignUpFormComponent } from './email-sign-up-form.component';

import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';

describe('EmailSignUpFormComponent', () => {
  let component: EmailSignUpFormComponent;
  let fixture: ComponentFixture<EmailSignUpFormComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailSignUpFormComponent ],
      providers: [
        { provide: NgxFirebaseAuthService, useValue: {} }
      ]
    })
    .overrideTemplate(EmailSignUpFormComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(EmailSignUpFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getters', () => {
    it('should have authService', () => {
      expect(component.authService).toBeTruthy();
    });
    it('should have submitting', () => {
      expect(component.submitting).toBe(false);
    });
  });
  describe('submitting setter', () => {
    let subscribedValue;
    beforeEach(() => {
      component.busy.subscribe(b => subscribedValue = b);
    });
    it('should emit', () => {
      component.submitting = true;
      expect(subscribedValue).toBe(true);
    });
  });
  describe('ngOnInit()', () => {
    it('should set formId', () => {
      component.ngOnInit();
      expect(component.formId).toBeTruthy();
    });
    it('should set up the form', () => {
      component.ngOnInit();
      expect(component.passwordFc).toEqual(jasmine.any(FormControl));
      expect(component.nameFc).toEqual(jasmine.any(FormControl));
      expect(component.fg).toEqual(jasmine.any(FormGroup));
      expect(component.fg.get('password')).toEqual(component.passwordFc);
      expect(component.fg.get('name')).toEqual(component.nameFc);
    });
    it('should emit false for busy', () => {
      spyOn(component.busy, 'emit').and.callThrough();
      component.ngOnInit();
      expect(component.busy.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('submit', () => {
    let apiSpy;
    beforeEach(() => {
      spyOn(component.success, 'emit').and.callThrough();
      spyOn(component.unhandledError, 'emit').and.callThrough();
      apiSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({createUserWithPassword: apiSpy});
      component.email = 'foo@bar.com';
      component.ngOnInit();
      component.passwordFc.setValue('password');
      component.nameFc.setValue('Foo Bar');
    });
    it('should handle success', fakeAsync(() => {
      const cred = {};
      apiSpy.and.callFake(() => Promise.resolve(cred));
      component.submit();
      expect(component.submitting).toBe(true);
      expect(apiSpy).toHaveBeenCalledWith('foo@bar.com', 'password', 'Foo Bar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.success.emit).toHaveBeenCalledWith(cred);
    }));
    it('should handle auth/weak-password', fakeAsync(() => {
      const error = {code: 'auth/weak-password'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(component.submitting).toBe(true);
      expect(apiSpy).toHaveBeenCalledWith('foo@bar.com', 'password', 'Foo Bar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError.emit).not.toHaveBeenCalled();
      expect(component.success.emit).not.toHaveBeenCalled();
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(true);
      component.passwordFc.setValue('');
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(false);
    }));
    it('should handle an unknown error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(component.submitting).toBe(true);
      expect(apiSpy).toHaveBeenCalledWith('foo@bar.com', 'password', 'Foo Bar');
      tick();
      expect(component.submitting).toBe(false);
      expect(component.unhandledError.emit).toHaveBeenCalledWith(error);
      expect(component.success.emit).not.toHaveBeenCalled();
      expect(component.passwordFc.hasError('auth/wrong-password')).toBe(false);
    }));

  });
});
