import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute } from '@angular/router';
import { SignUpComponent } from './sign-up.component';
import { auth } from 'firebase/app';

import {
  NgxFirebaseAuthRoute
} from '../shared';
describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignUpComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
      ]
    })
    .overrideTemplate(SignUpComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(SignUpComponent);
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
    let validateEmailHasNoAccountSpy;
    beforeEach(() => {
      validateEmailHasNoAccountSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(null));
      spyOnProperty(component, 'authService').and.returnValue({
        emailHasNoAccountValidator: validateEmailHasNoAccountSpy
      });
      component.initFg();
    });
    it('should set nameFc', () => {
      expect(component.nameFc).toEqual(jasmine.any(FormControl));
      expect(component.nameFc.value).toBe('');
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
      expect(component.fg.get('name')).toBe(component.nameFc);
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
    let createUserSpy;
    let updateProfileSpy;
    let reloadSpy;
    let pushSignInSuccessSpy;
    let validateEmailHasNoAccountSpy;
    beforeEach(() => {
      validateEmailHasNoAccountSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(null));
      pushSignInSuccessSpy = jasmine.createSpy();
      updateProfileSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      reloadSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      user = {updateProfile: updateProfileSpy, reload: reloadSpy};
      cred = {user: user};
      createUserSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      setPersistenceSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        createUserWithEmailAndPassword: createUserSpy,
        setPersistence: setPersistenceSpy,
      });
      spyOnProperty(component, 'authService').and.returnValue({
        pushSignInSuccess: pushSignInSuccessSpy,
        emailHasNoAccountValidator: validateEmailHasNoAccountSpy
      });
      component.initFg();
      component.fg.setValue({
        name: 'Foo Bar',
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
    it('should call createUserWithEmailAndPassword', fakeAsync(() => {
      component.submit();
      tick();
      expect(createUserSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
    }));
    it('should handle a create user error', fakeAsync(() => {
      const error = {code: 'auth/some-create-user-error'};
      createUserSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.unhandledError).toBe(error);
    }));
    it('should call user.updateProfile', fakeAsync(() => {
      component.submit();
      tick();
      expect(updateProfileSpy).toHaveBeenCalledWith({displayName: 'Foo Bar', photoURL: null});
    }));
    it('should handle an updateProfile error', fakeAsync(() => {
      const error = {code: 'auth/some-update-profile-error'};
      updateProfileSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.unhandledError).toBe(error);
      expect(reloadSpy).not.toHaveBeenCalled();
    }));
    it('should reload the user', fakeAsync(() => {
      component.submit();
      tick();
      expect(reloadSpy).toHaveBeenCalled();
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
    it('should set unhandledError to null on success', fakeAsync(() => {
      component.unhandledError = {} as any;
      component.submit();
      tick();
      expect(component.unhandledError).toBe(null);
    }));
    it('should set submitting on failure', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      createUserSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
    }));

    it('should handle auth/weak-password', fakeAsync(() => {
      component.unhandledError = {} as any;
      const error = {code: 'auth/weak-password'};
      createUserSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(true);
      expect(component.unhandledError).toBe(null);
      component.passwordFc.setValue('');
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(false);
    }));
    it('should handle an unknown error auth/foo', fakeAsync(() => {
      component.unhandledError = {} as any;
      const error = {code: 'auth/foo'};
      createUserSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.unhandledError).toBe(error);
    }));
  });
});
