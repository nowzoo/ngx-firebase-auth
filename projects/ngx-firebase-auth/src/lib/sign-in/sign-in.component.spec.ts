import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SignInComponent } from './sign-in.component';
import { auth } from 'firebase/app';

import {
  NgxFirebaseAuthRoute
} from '../shared';
describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(SignInComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(SignInComponent);
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
    it('should set passwordFc', () => {
      expect(component.passwordFc).toEqual(jasmine.any(FormControl));
      expect(component.passwordFc.value).toBe('');
    });
    it('should set rememberFc', () => {
      expect(component.rememberFc).toEqual(jasmine.any(FormControl));
      expect(component.rememberFc.value).toBe(true);
    });
    it('should set up the form group', () => {
      expect(component.fg).toEqual(jasmine.any(FormGroup));
      expect(component.fg.get('email')).toBe(component.emailFc);
      expect(component.fg.get('password')).toBe(component.passwordFc);
      expect(component.fg.get('remember')).toBe(component.rememberFc);
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
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.signUp);
    });
    it('should call initFg', () => {
      component.ngOnInit();
      expect(component.initFg).toHaveBeenCalledWith();
    });
  });
  describe('submit', () => {
    let user;
    let cred;
    let setPersistenceSpy;
    let signInSpy;
    let pushCredSpy;
    let navigateSpy;
    let getIndexRouterLinkSpy;
    beforeEach(() => {
      spyOn(component, 'validateEmail').and.callFake(() => Promise.resolve(null));
      pushCredSpy = jasmine.createSpy();
      user = {};
      cred = {user: user};
      signInSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      setPersistenceSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      navigateSpy = jasmine.createSpy();
      getIndexRouterLinkSpy = jasmine.createSpy().and.callFake(() => ['/', 'auth']);
      spyOnProperty(component, 'auth').and.returnValue({
        signInWithEmailAndPassword: signInSpy,
        setPersistence: setPersistenceSpy,
      });
      spyOnProperty(component, 'authService').and.returnValue({
        pushCred: pushCredSpy,
        getIndexRouterLink: getIndexRouterLinkSpy
      });
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
      component.initFg();
      component.fg.setValue({
        email: 'foo@bar.com',
        password: 'password',
        remember: true
      });
    });

    it('should set the persistence if remember is true', fakeAsync(() => {
      component.rememberFc.setValue(true);
      component.submit();
      tick();
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.LOCAL);
    }));
    it('should set the persistence if remember is false', fakeAsync(() => {
      component.rememberFc.setValue(false);
      component.submit();
      tick();
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.SESSION);
    }));
    it('should handle setPersistence api error', fakeAsync(() => {
      const error = {code: 'auth/some-persistence-error'};
      setPersistenceSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.unhandledError).toBe(error);
    }));
    it('should call signInWithEmailAndPassword', fakeAsync(() => {
      component.submit();
      tick();
      expect(signInSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
    }));
    it('should handle a sign in error', fakeAsync(() => {
      const error = {code: 'auth/some-error'};
      signInSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.unhandledError).toBe(error);
    }));
    it('should call authService.pushCred', fakeAsync(() => {
      component.submit();
      tick();
      expect(pushCredSpy).toHaveBeenCalledWith(cred);
    }));
    it('should set submitting on success', fakeAsync(() => {
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(true);
    }));
    it('should set unhandledError to null on success', fakeAsync(() => {
      component.unhandledError = {} as any;
      component.submit();
      tick();
      expect(component.unhandledError).toBe(null);
    }));
    it('should set submitting on failure', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      signInSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
    }));
    it('should handle auth/wrong-password', fakeAsync(() => {
      component.unhandledError = {} as any;
      const error = {code: 'auth/wrong-password'};
      signInSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.passwordFc.hasError('auth/wrong-password')).toBe(true);
      expect(component.unhandledError).toBe(null);
      component.passwordFc.setValue('');
      expect(component.passwordFc.hasError('auth/wrong-password')).toBe(false);
    }));
    it('should handle an unknown error auth/foo', fakeAsync(() => {
      component.unhandledError = {} as any;
      const error = {code: 'auth/foo'};
      signInSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.unhandledError).toBe(error);
    }));
    it('should navigate if the redirect is not cancelled', fakeAsync(() => {
      component.authService.redirectCancelled = false;
      component.submit();
      tick();
      expect(navigateSpy).toHaveBeenCalledWith(getIndexRouterLinkSpy.calls.mostRecent().returnValue);
    }));
    it('should not navigate if the redirect is cancelled', fakeAsync(() => {
      component.authService.redirectCancelled = true;
      component.submit();
      tick();
      expect(navigateSpy).not.toHaveBeenCalled();
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
