import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';

import {
  NgxFirebaseAuthRoute
} from './shared';

describe('NgxFirebaseAuthService', () => {
  let service: NgxFirebaseAuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NgxFirebaseAuthService,
        {provide: AngularFireAuth, useValue: {auth: {}, authState: new Subject()}},
      ]
    });
    service = TestBed.get(NgxFirebaseAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have signInSuccess observable', () => {
    expect(service.signInSuccess.subscribe).toBeTruthy();
  });
  it('should have a route obs', () => {
    expect(service.route.subscribe).toBeTruthy();
  });

  it('should have authState', () => {
    expect(service.authState).toBeTruthy();
  });
  it('should have auth', () => {
    expect(service.auth).toBeTruthy();
  });

  describe('pushSignInSuccess(cred)', () => {
    let result;
    beforeEach(() => {
      result = undefined;
      service.signInSuccess.subscribe(r => result = r);
    });
    it('should push the cred', () => {
      const cred: any = {};
      service.pushSignInSuccess(cred);
      expect(result).toBe(cred);
    });
  });

  describe('setRoute', () => {
    let value;
    beforeEach(() => {
      service.route.subscribe(v => value = v);
    });
    it('should push the route', () => {
      service.setRoute(NgxFirebaseAuthRoute.signIn);
      expect(value).toBe(NgxFirebaseAuthRoute.signIn);
    });
  });

  describe('pushActionCodeSuccess(info)', () => {
    let authState: Subject<any>;
    let user;
    let info: any;
    beforeEach(() => {
      info = {};
      user = {};
      authState = new Subject();
      spyOnProperty(service, 'authState').and.returnValue(authState.asObservable());
    });
    it('should resolve only after the authState resolves', fakeAsync(() => {
      let resolved;
      service.pushActionCodeSuccess(info).then(r => resolved = r);
      tick();
      expect(resolved).toBeUndefined();
      authState.next(null);
      tick();
      expect(resolved).toEqual({user: null, actionCodeInfo: info});
    }));
    it('should resolve only after the authState resolves if user signed in', fakeAsync(() => {
      let resolved;
      service.pushActionCodeSuccess(info).then(r => resolved = r);
      tick();
      expect(resolved).toBeUndefined();
      authState.next(user);
      tick();
      expect(resolved).toEqual({user: user, actionCodeInfo: info});
    }));
  });

  describe('setBaseRoute(route: ActivatedRoute)', () => {
    it('should work if there is no parent', () => {
      const snapshot = {url: [{path: 'auth'}], parent: null};
      const route: any = {snapshot: snapshot};
      service.setBaseRoute(route);
      expect(service.baseRouteSlugs).toEqual(['/', 'auth'] );
    });
    it('should work if there is a parent', () => {
      const snapshot = {url: [{path: 'auth'}], parent: {
        url: [{path: 'foo'}]
      }};
      const route: any = {snapshot: snapshot};
      service.setBaseRoute(route);
      expect(service.baseRouteSlugs).toEqual(['/', 'foo', 'auth'] );
    });
    it('should work if url is empty', () => {
      const snapshot = {url: [], parent: null};
      const route: any = {snapshot: snapshot};
      service.setBaseRoute(route);
      expect(service.baseRouteSlugs).toEqual(['/'] );
    });
  });

  describe('link getters', () => {
    beforeEach(() => {
      const snapshot = {url: [{path: 'auth'}], parent: null};
      const route: any = {snapshot: snapshot};
      service.setBaseRoute(route);
    });

    it('should have getOobResetPasswordRouterLink() and return the right slugs', () => {
      expect(service.getOobResetPasswordRouterLink()).toEqual(['/', 'auth', 'oob', 'reset-password']);
    });
    it('should have getOobRecoverEmailRouterLink() and return the right slugs', () => {
      expect(service.getOobRecoverEmailRouterLink()).toEqual(['/', 'auth', 'oob', 'recover-email']);
    });
    it('should have getOobVerifyEmailRouterLink() and return the right slugs', () => {
      expect(service.getOobVerifyEmailRouterLink()).toEqual(['/', 'auth', 'oob', 'verify-email']);
    });

    it('should have getSignInRouterLink() and return the right slugs', () => {
      expect(service.getSignInRouterLink()).toEqual(['/', 'auth', 'sign-in']);
    });
    it('should have getSignUpRouterLink() and return the right slugs', () => {
      expect(service.getSignUpRouterLink()).toEqual(['/', 'auth', 'sign-up']);
    });

    it('should have getSignOutRouterLink() and return the right slugs', () => {
      expect(service.getSignOutRouterLink()).toEqual(['/', 'auth', 'sign-out']);
    });
    it('should have getVerifyEmailRouterLink() and return the right slugs', () => {
      expect(service.getVerifyEmailRouterLink()).toEqual(['/', 'auth', 'verify-email']);
    });

    // getResetPasswordRouterLink
    it('should have getResetPasswordRouterLink() and return the right slugs', () => {
      expect(service.getResetPasswordRouterLink()).toEqual(['/', 'auth', 'reset-password']);
    });
    //
  });


  describe('validateEmailHasPassword(fc)', () => {
    let emailFc: FormControl;
    let fetchSignInMethodsForEmailSpy;
    let validateSpy;
    beforeEach(() => {
      validateSpy = spyOn(service, 'validateEmailHasPassword').and.callThrough();
      fetchSignInMethodsForEmailSpy = jasmine.createSpy();
      spyOnProperty(service, 'auth').and.returnValue({
        fetchSignInMethodsForEmail: fetchSignInMethodsForEmailSpy
      });
      emailFc = new FormControl('', {
        asyncValidators: [service.emailHasPasswordValidator]
      });

    });
    it('should be required error if control is empty', fakeAsync(() => {
      emailFc.setValue('');
      tick();
      expect(emailFc.errors).toEqual({required: true});
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
    }));
    it('should be email error if control is not an email', fakeAsync(() => {
      emailFc.setValue('foo');
      tick();
      expect(emailFc.errors).toEqual({email: true});
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
    }));
    it('should be error ngx-firebase-auth/user-not-found if the methods are empty', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve([]));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual({'ngx-firebase-auth/user-not-found': true});
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    }));
    it('should be error ngx-firebase-auth/no-password if the methods do not have password', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['twitter.com']));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual({'ngx-firebase-auth/no-password': true});
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    }));
    it('should be null if the methods has password', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['twitter.com', 'password']));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual(null);
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    }));
    it('should be whatever code the api call rejects with', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.reject({code: 'auth/invalid-email'}));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual({'auth/invalid-email': true});
    }));
  });

  describe('validateEmailHasNoAccount(fc)', () => {
    let emailFc: FormControl;
    let fetchSignInMethodsForEmailSpy;
    let validateSpy;
    beforeEach(() => {
      validateSpy = spyOn(service, 'validateEmailHasNoAccount').and.callThrough();
      fetchSignInMethodsForEmailSpy = jasmine.createSpy();
      spyOnProperty(service, 'auth').and.returnValue({
        fetchSignInMethodsForEmail: fetchSignInMethodsForEmailSpy
      });
      emailFc = new FormControl('', {
        asyncValidators: [service.emailHasNoAccountValidator]
      });

    });
    it('should be required error if control is empty', fakeAsync(() => {
      emailFc.setValue('');
      tick();
      expect(emailFc.errors).toEqual({required: true});
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
    }));
    it('should be email error if control is not an email', fakeAsync(() => {
      emailFc.setValue('foo');
      tick();
      expect(emailFc.errors).toEqual({email: true});
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
    }));
    it('should be error ngx-firebase-auth/user-not-found if the methods are not empty', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['password']));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual({'ngx-firebase-auth/email-already-in-use': ['password']});
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    }));

    it('should be null if the methods are empty', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve([]));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual(null);
      expect(validateSpy).toHaveBeenCalled();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
    }));
    it('should be whatever code the api call rejects with', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.reject({code: 'auth/invalid-email'}));
      emailFc.setValue('foo@bar.com');
      tick();
      expect(emailFc.errors).toEqual({'auth/invalid-email': true});
    }));
  });
});
