import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute } from '@angular/router';
import { SignInComponent } from './sign-in.component';
import { auth } from 'firebase/app';
import { NgxFirebaseAuthRoute } from '../shared';
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
    it('should set cred to null', () => {
      component.cred = {} as any;
      component.reset();
      expect(component.cred).toBe(null);
    });
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
    let pushSignInSuccessSpy;
    let validateEmailHasPasswordSpy;
    beforeEach(() => {
      validateEmailHasPasswordSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(null));
      pushSignInSuccessSpy = jasmine.createSpy();
      user = {};
      cred = {user: user};
      signInSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      setPersistenceSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());

      spyOnProperty(component, 'auth').and.returnValue({
        signInWithEmailAndPassword: signInSpy,
        setPersistence: setPersistenceSpy,
      });
      spyOnProperty(component, 'authService').and.returnValue({
        pushSignInSuccess: pushSignInSuccessSpy,
        emailHasPasswordValidator: validateEmailHasPasswordSpy
      });
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
    it('should call authService.pushSignInSuccess', fakeAsync(() => {
      component.submit();
      tick();
      expect(pushSignInSuccessSpy).toHaveBeenCalledWith(cred);
    }));
    it('should set submitting on success', fakeAsync(() => {
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
    }));
    it('should set submitting on success', fakeAsync(() => {
      component.submit();
      expect(component.cred).toBe(null);
      tick();
      expect(component.cred).toBe(cred);
    }));
    it('should set screen on success', fakeAsync(() => {
      component.submit();
      tick();
      expect(component.screen).toBe('success');
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
      expect(component.screen).toBe('form');
    }));
    it('should handle an unknown error auth/foo', fakeAsync(() => {
      component.unhandledError = {} as any;
      const error = {code: 'auth/foo'};
      signInSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.unhandledError).toBe(error);
      expect(component.screen).toBe('error');
    }));

  });
});
