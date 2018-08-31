import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SignInFormComponent } from './sign-in-form.component';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';

describe('SignInFormComponent', () => {
  let component: SignInFormComponent;
  let fixture: ComponentFixture<SignInFormComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInFormComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},

      ]
    })
    .overrideTemplate(SignInFormComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(SignInFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getters', () => {
    it('should have auth', () => {
      expect(component.auth).toBeTruthy();
    });
    it('should have authService', () => {
      expect(component.authService).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    let rememberChangeSpy;
    beforeEach(() => {
      component.email = 'foo@bar.com';
      component.remember = true;
      rememberChangeSpy = spyOn(component.rememberChange, 'emit').and.callThrough();
    });
    it('should emit on remember change', () => {
      component.ngOnInit();
      component.rememberFc.setValue(false);
      expect(rememberChangeSpy).toHaveBeenCalledWith(false);
      component.rememberFc.setValue(true);
      expect(rememberChangeSpy).toHaveBeenCalledWith(true);
    });
    it('should set up fg', () => {
      component.ngOnInit();
      expect(component.emailFc.value).toBe(component.email);
      expect(component.fg.get('email')).toBe(component.emailFc);
      expect(component.passwordFc.value).toBe('');
      expect(component.fg.get('password')).toBe(component.passwordFc);
      expect(component.rememberFc.value).toBe(component.remember);
      expect(component.fg.get('remember')).toBe(component.rememberFc);
    });
  });
  describe('ngAfterViewInit()', () => {
    let elRef;
    beforeEach(() => {
      elRef = {nativeElement: {focus: jasmine.createSpy()}};
    });
    it('should focus the input', () => {
      component.passwordInput = elRef;
      component.ngAfterViewInit();
      expect(elRef.nativeElement.focus).toHaveBeenCalled();
    });
  });
  describe('submit()', () => {
    let cred;
    let fetchSignInMethodsForEmailSpy;
    let signInWithEmailAndPasswordSpy;
    let setRememberedSpy;
    let successEmitSpy;
    let errorEmitSpy;
    beforeEach(() => {
      cred = {};
      fetchSignInMethodsForEmailSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(['password']));
      signInWithEmailAndPasswordSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      setRememberedSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      component.emailFc = new FormControl('foo@bar.com');
      component.passwordFc = new FormControl('password');
      component.rememberFc = new FormControl(true);
      spyOnProperty(component, 'auth').and.returnValue({
        fetchSignInMethodsForEmail: fetchSignInMethodsForEmailSpy,
        signInWithEmailAndPassword: signInWithEmailAndPasswordSpy
      });
      spyOnProperty(component, 'authService').and.returnValue({
        setRemembered: setRememberedSpy,
      });
      successEmitSpy = spyOn(component.success, 'emit').and.callThrough();
      errorEmitSpy = spyOn(component.error, 'emit').and.callThrough();
    });
    it('should handle success', fakeAsync(() => {
      component.submit();
      expect(component.submitting).toBe(true);
      expect(component.methodsForEmail).toEqual([]);
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.methodsForEmail).toEqual(['password']);
      expect(signInWithEmailAndPasswordSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(setRememberedSpy).toHaveBeenCalledWith(true, 'foo@bar.com');
      expect(successEmitSpy).toHaveBeenCalledWith(cred);
    }));

    it('should handle the case when the email has no sign in method', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve([]));
      component.submit();
      tick();
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));

    it('should handle the case when the email has no password', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['twitter.com']));
      component.submit();
      tick();
      expect(component.emailFc.hasError('ngx-firebase-auth/no-password')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('ngx-firebase-auth/no-password')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should handle the case when fetchSignInMethodsForEmail returns auth/invalid-email', fakeAsync(() => {
      const error = {code: 'auth/invalid-email'};
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should handle auth/user-not-found error', fakeAsync(() => {
      const error = {code: 'auth/user-not-found'};
      signInWithEmailAndPasswordSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.submitting).toBe(false);
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should handle auth/user-disabled error', fakeAsync(() => {
      const error = {code: 'auth/user-disabled'};
      signInWithEmailAndPasswordSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.submitting).toBe(false);
      expect(component.emailFc.hasError('auth/user-disabled')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('auth/user-disabled')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should handle auth/wrong-password error', fakeAsync(() => {
      const error = {code: 'auth/wrong-password'};
      signInWithEmailAndPasswordSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.submitting).toBe(false);
      expect(component.passwordFc.hasError('auth/wrong-password')).toBe(true);
      component.passwordFc.setValue('foo');
      expect(component.passwordFc.hasError('auth/wrong-password')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should handle unknown error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      signInWithEmailAndPasswordSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.submitting).toBe(false);
      expect(errorEmitSpy).toHaveBeenCalledWith(error);
    }));
  });
});
