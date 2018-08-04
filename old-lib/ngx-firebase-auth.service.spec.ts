import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';
import { NGX_FIREBASE_AUTH_OPTIONS, NgxFirebaseAuthOAuthMethod, NgxFirebaseAuthRoute } from './shared';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxRouteUtils } from '@nowzoo/ngx-route-utils';
import { auth } from 'firebase/app';


describe('NgxFirebaseAuthService', () => {
  let service: NgxFirebaseAuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NgxFirebaseAuthService,
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}, authState: new BehaviorSubject(null)}},
        {provide: Router, useValue: {}}
      ]
    });
    service = TestBed.get(NgxFirebaseAuthService);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getters', () => {
    it('should have options', () => {
      expect(service.options).toBeTruthy();
    });
    it('should have auth', () => {
      expect(service.auth).toBeTruthy();
    });
    it('should have authState', () => {
      expect(service.authState).toBeTruthy();
    });
    it('should have router', () => {
      expect(service.router).toBeTruthy();
    });
    it('should have authRedirectCancelled', () => {
      expect(service.authRedirectCancelled).toBe(false);
    });
    it('should have onAuth', () => {
      expect(service.onAuth).toBeTruthy();
    });
    it('should have baseRoute', () => {
      expect(service.baseRoute).toBeTruthy();
    });
    it('should have routeShown', () => {
      expect(service.routeShown).toBeTruthy();
    });
    it('should have internalRedirectMessage', () => {
        expect(service.internalRedirectMessage).toBe(null);
    });
    it('should have oAuthMethod', () => {
      expect(service.oAuthMethod).toBe(NgxFirebaseAuthOAuthMethod.redirect);
      service.setOAuthMethod(NgxFirebaseAuthOAuthMethod.popup);
      expect(service.oAuthMethod).toBe(NgxFirebaseAuthOAuthMethod.popup);
    });
  });


  describe('setRoute(r)', () => {
    let subRoute;
    beforeEach(() => {
      service.routeShown.subscribe(v => subRoute = v);
    });
    it('should push the route onto routeShown', () => {
      service.setRoute(NgxFirebaseAuthRoute.oob);
      expect(subRoute).toBe(NgxFirebaseAuthRoute.oob);
    });
  });

  describe('setOAuthMethod(method)', () => {
    it('should set the private variable', () => {
      service.setOAuthMethod(NgxFirebaseAuthOAuthMethod.popup);
      expect(service.oAuthMethod).toBe(NgxFirebaseAuthOAuthMethod.popup);
      service.setOAuthMethod(NgxFirebaseAuthOAuthMethod.redirect);
      expect(service.oAuthMethod).toBe(NgxFirebaseAuthOAuthMethod.redirect);
    });
  });

  describe('initBaseRoute(route)', () => {
    it('should call NgxRouteUtils.urlFromRoute', () => {
      spyOn(NgxRouteUtils, 'urlFromRoute').and.callFake(() => '/auth');
      const route: any = {};
      service.initBaseRoute(route);
      expect(NgxRouteUtils.urlFromRoute).toHaveBeenCalledWith(route);
      expect(service.baseRoute).toBe('/auth');
    });
  });

  describe('getRouterLink(path?)', () => {
    beforeEach(() => {
      spyOnProperty(service, 'baseRoute').and.returnValue('/auth');
    });
    it('should work if passed nothing', () => {
      expect(service.getRouterLink()).toEqual(['/auth']);
    });
    it('should work if passed a string', () => {
      expect(service.getRouterLink('sign-in')).toEqual(['/auth', 'sign-in']);
    });
    it('should work if passed an array ', () => {
      expect(service.getRouterLink(['sign-in', 'foo'])).toEqual(['/auth', 'sign-in', 'foo']);
    });
  });

  describe('internalRedirect', () => {
    let navSpy;
    let routerLinkSpy;
    beforeEach(() => {
      navSpy = jasmine.createSpy();
      spyOnProperty(service, 'router').and.returnValue({navigate: navSpy});
      routerLinkSpy = spyOn(service, 'getRouterLink').and.callFake(() => ['/auth', 'foo']);
    });
    it('should navigate', () => {
      service.internalRedirect('foo');
      expect(navSpy).toHaveBeenCalledWith(['/auth', 'foo']);
    });
    it('should set internalRedirectMessage', () => {
      service.internalRedirect('foo', 'bar');
      expect(service.internalRedirectMessage).toBe('bar');
    });
  });

  describe('cancelAuthRedirect()', () => {
    it('should set authRedirectCancelled to true', () => {
      expect(service.authRedirectCancelled).toBe(false);
      service.cancelAuthRedirect();
      expect(service.authRedirectCancelled).toBe(true);
    });
  });

  describe('signInWithPassword(email, password)', () => {
    let cred;
    let signInSpy;
    let handleAuthSuccessSpy;
    beforeEach(() => {
      cred = {user: {uid: 'a-uid'}};
      signInSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      handleAuthSuccessSpy = spyOn(service, 'handleAuthSuccess').and.callFake(() => cred);
      spyOnProperty(service, 'auth').and.returnValue({signInWithEmailAndPassword: signInSpy});
    });
    it('should resolve with the cred after making the requisite calls', fakeAsync(() => {
      let resolved;
      service.signInWithPassword('foo@bar.com', 'password')
        .then(result => resolved = result);
      tick();
      expect(resolved).toBe(cred);
      expect(signInSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(handleAuthSuccessSpy).toHaveBeenCalledWith(cred);
    }));
    it('should reject if sign in api fails', fakeAsync(() => {
      const error = {code: 'foo'};
      signInSpy.and.callFake(() => Promise.reject(error));
      let rejected;
      service.signInWithPassword('foo@bar.com', 'password').catch(e => rejected = e);
      tick();
      expect(rejected).toBe(error);
    }));
  });

  describe('createUserWithPassword(email, password, name)', () => {

    let updateProfileSpy;
    let reloadSpy;
    let cred;
    let createSpy;
    let handleAuthSuccessSpy;
    beforeEach(() => {
      updateProfileSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      reloadSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      cred = {user: {uid: 'a-uid', reload: reloadSpy, updateProfile: updateProfileSpy}};
      createSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      handleAuthSuccessSpy = spyOn(service, 'handleAuthSuccess').and.callFake(() => cred);
      spyOnProperty(service, 'auth').and.returnValue({createUserWithEmailAndPassword: createSpy});
    });
    it('should resolve with the cred after making the requisite calls', fakeAsync(() => {
      let resolved;
      service.createUserWithPassword('foo@bar.com', 'password', 'Foo Bar')
        .then(result => resolved = result);
      tick();
      expect(resolved).toBe(cred);
      expect(createSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(updateProfileSpy).toHaveBeenCalledWith({displayName: 'Foo Bar', photoURL: null});
      expect(reloadSpy).toHaveBeenCalledWith();
      expect(handleAuthSuccessSpy).toHaveBeenCalledWith(cred);
    }));

    it('should reject if create user api fails', fakeAsync(() => {
      const error = {code: 'foo'};
      createSpy.and.callFake(() => Promise.reject(error));
      let rejected;
      service.createUserWithPassword('foo@bar.com', 'password', 'Foo Bar').catch(e => rejected = e);
      tick();
      expect(rejected).toBe(error);
      expect(handleAuthSuccessSpy).not.toHaveBeenCalled();
    }));
    it('should reject if update profile api fails', fakeAsync(() => {
      const error = {code: 'foo'};
      updateProfileSpy.and.callFake(() => Promise.reject(error));
      let rejected;
      service.createUserWithPassword('foo@bar.com', 'password', 'Foo Bar').catch(e => rejected = e);
      tick();
      expect(rejected).toBe(error);
      expect(handleAuthSuccessSpy).not.toHaveBeenCalled();
    }));
    it('should reject if reload api fails', fakeAsync(() => {
      const error = {code: 'foo'};
      reloadSpy.and.callFake(() => Promise.reject(error));
      let rejected;
      service.createUserWithPassword('foo@bar.com', 'password', 'Foo Bar').catch(e => rejected = e);
      tick();
      expect(rejected).toBe(error);
      expect(handleAuthSuccessSpy).not.toHaveBeenCalled();
    }));
  });

  describe('getOAuthProviderById(id)', () => {
    let optionsSpy;
    beforeEach(() => {
      optionsSpy = spyOnProperty(service, 'options').and.returnValue({methods: []});
    });
    it('should return a TwitterAuthProvider if passed twitter.com', () => {
      expect(service.getOAuthProviderById('twitter.com')).toEqual(jasmine.any(auth.TwitterAuthProvider));
    });
    it('should return a FacebookAuthProvider if passed facebook.com', () => {
      expect(service.getOAuthProviderById('facebook.com')).toEqual(jasmine.any(auth.FacebookAuthProvider));
    });
    it('should return a GoogleAuthProvider if passed google.com', () => {
      expect(service.getOAuthProviderById('google.com')).toEqual(jasmine.any(auth.GoogleAuthProvider));
    });
    it('should return a GithubAuthProvider if passed github.com', () => {
      expect(service.getOAuthProviderById('github.com')).toEqual(jasmine.any(auth.GithubAuthProvider));
    });
    it('should return null if passed an unrecognized id', () => {
      expect(service.getOAuthProviderById('foo.com')).toBe(null);
    });
    it('should return the result of options.authProviderFactory if that is set', () => {
      const provider = {};
      const spy = jasmine.createSpy().and.returnValue(provider);
      optionsSpy.and.returnValue({methods: [], authProviderFactory: spy});
      expect(service.getOAuthProviderById('github.com')).toBe(provider);
      expect(spy).toHaveBeenCalledWith('github.com');
    });
  });

  describe('signInWithRedirect(providerId)', () => {
    let provider;
    let apiSpy;
    beforeEach(() => {
      provider = {};
      spyOn(service, 'getOAuthProviderById').and.callFake(() => provider);
      apiSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(service, 'auth').and.returnValue({signInWithRedirect: apiSpy});
    });
    it('should resolve after making the requisite calls', fakeAsync(() => {
      let resolved;
      service.signInWithRedirect('twitter.com').then(() => resolved = true);
      tick();
      expect(resolved).toBe(true);
      expect(service.getOAuthProviderById).toHaveBeenCalledWith('twitter.com');
      expect(apiSpy).toHaveBeenCalledWith(provider);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      const error = {code: 'foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      let rejected;
        service.signInWithRedirect('twitter.com').catch((e) => rejected = e);
        tick();
        expect(rejected).toBe(error);
    }));
  });

  describe('signInWithPopup', () => {
    let cred;
    let apiSpy;
    let provider;
    let handleAuthSuccessSpy;
    beforeEach(() => {
      cred = {user: {}};
      provider = {};
      spyOn(service, 'getOAuthProviderById').and.callFake(() => provider);
      apiSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      spyOnProperty(service, 'auth').and.returnValue({signInWithPopup: apiSpy});
      handleAuthSuccessSpy = spyOn(service, 'handleAuthSuccess').and.callFake(() => cred);
    });
    it('should resolve with the cred after making the requisite calls', fakeAsync(() => {
      let resolved;
      service.signInWithPopup('twitter.com').then((r) => resolved = r);
      tick();
      expect(resolved).toBe(cred);
      expect(service.getOAuthProviderById).toHaveBeenCalledWith('twitter.com');
      expect(apiSpy).toHaveBeenCalledWith(provider);
      expect(handleAuthSuccessSpy).toHaveBeenCalledWith(cred);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      const error = {code: 'foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      let rejected;
        service.signInWithPopup('twitter.com').catch((e) => rejected = e);
        tick();
        expect(rejected).toBe(error);
    }));
  });

  describe('getRedirectResult()', () => {
    let cred;
    let apiSpy;
    let handleAuthSuccessSpy;
    beforeEach(() => {
      cred = {user: {}};
      apiSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      spyOnProperty(service, 'auth').and.returnValue({getRedirectResult: apiSpy});
      handleAuthSuccessSpy = spyOn(service, 'handleAuthSuccess').and.callFake(() => cred);
    });
    it('should resolve with null if cred.user is null', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve({user: null}));
      let resolved;
      service.getRedirectResult().then(r => resolved = r);
      tick();
      expect(resolved).toBe(null);
      expect(apiSpy).toHaveBeenCalled();
      expect(handleAuthSuccessSpy).not.toHaveBeenCalled();
    }));
    it('should resolve after making the requisite calls on success', fakeAsync(() => {
      let resolved;
      service.getRedirectResult().then(r => resolved = r);
      tick();
      expect(resolved).toBe(cred);
      expect(apiSpy).toHaveBeenCalled();
      expect(handleAuthSuccessSpy).toHaveBeenCalledWith(cred);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      const error = {code: 'foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      let rejected;
      service.getRedirectResult().catch(e => rejected = e);
      tick();
      expect(rejected).toBe(error);
      expect(apiSpy).toHaveBeenCalled();
      expect(handleAuthSuccessSpy).not.toHaveBeenCalled();
    }));
  });

  describe('handleAuthSuccess(cred)', () => {
    let cred;
    let credfromSub;
    let navSpy;
    let cancelledSpy;
    beforeEach(() => {
      cred = {user: {}};
      service.onAuth.subscribe(v => credfromSub = v);
      navSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(service, 'router').and.returnValue({navigate: navSpy});
      cancelledSpy = spyOnProperty(service, 'authRedirectCancelled').and.returnValue(true);
    });
    it('should return the cred', () => {
      expect(service.handleAuthSuccess(cred)).toBe(cred);
    });
    it('should push the cred to onAuth observable', () => {
      service.handleAuthSuccess(cred);
      expect(credfromSub).toBe(cred);
    });
    it('should navigate if redirect not cancelled', () => {
      cancelledSpy.and.returnValue(false);
      service.handleAuthSuccess(cred);
      expect(navSpy).toHaveBeenCalledWith([service.baseRoute]);
    });
    it('should not navigate if redirect cancelled', () => {
      cancelledSpy.and.returnValue(true);
      service.handleAuthSuccess(cred);
      expect(navSpy).not.toHaveBeenCalled();
    });
  });

  describe('signInWithOAuth(providerId)', () => {
    let cred;
    let methodSpy;
    beforeEach(() => {
      cred = {};
      methodSpy = spyOnProperty(service, 'oAuthMethod').and.returnValue(NgxFirebaseAuthOAuthMethod.redirect);
      spyOn(service, 'signInWithRedirect').and.callFake(() => Promise.resolve());
      spyOn(service, 'signInWithPopup').and.callFake(() => Promise.resolve(cred));
    });
    it('should redirect and resolve with null if that is the method', fakeAsync(() => {
      methodSpy.and.returnValue(NgxFirebaseAuthOAuthMethod.redirect);
      let resolved;
      service.signInWithOAuth('twitter.com').then(r => resolved = r);
      tick();
      expect(resolved).toBe(null);
      expect(service.signInWithRedirect).toHaveBeenCalledWith('twitter.com');
    }));
    it('should popup and resolve with cred if that is the method', fakeAsync(() => {
      methodSpy.and.returnValue(NgxFirebaseAuthOAuthMethod.popup);
      let resolved;
      service.signInWithOAuth('twitter.com').then((r) => resolved = r);
      tick();
      expect(resolved).toBe(cred);
      expect(service.signInWithPopup).toHaveBeenCalledWith('twitter.com');
    }));
  });

  describe('setRememberOnDevice(b)', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOn(window.localStorage, 'setItem').and.callFake(() => {});
      spyOnProperty(service, 'auth').and.returnValue({setPersistence: apiSpy});
    });
    it('should resolve with true if passed true after making the requisite calls', fakeAsync(() => {
      let resolved;
      service.setRememberOnDevice(true).then(b => resolved = b);
      tick();
      expect(resolved).toBe(true);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        NgxFirebaseAuthService.persistenceStorageKey,
        auth.Auth.Persistence.LOCAL
      );
      expect(apiSpy).toHaveBeenCalledWith(auth.Auth.Persistence.LOCAL);
    }));
    it('should resolve with false if passed false after making the requisite calls', fakeAsync(() => {
      let resolved;
      service.setRememberOnDevice(false).then(b => resolved = b);
      tick();
      expect(resolved).toBe(false);
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        NgxFirebaseAuthService.persistenceStorageKey,
        auth.Auth.Persistence.SESSION
      );
      expect(apiSpy).toHaveBeenCalledWith(auth.Auth.Persistence.SESSION);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      const error = {code: 'foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      let rejected;
      service.setRememberOnDevice(false).catch(e => rejected = e);
      tick();
      expect(rejected).toBe(error);
    }));
  });

  describe('getRememberOnDevice()', () => {
    let setSpy;
    let storageGetSpy;
    beforeEach(() => {
      setSpy = spyOn(service, 'setRememberOnDevice').and.callFake(() => Promise.resolve(true));
      storageGetSpy  = spyOn(window.localStorage, 'getItem');
    });
    it('should resolve with true if the stored value is local', fakeAsync(() => {
      storageGetSpy.and.callFake(() => auth.Auth.Persistence.LOCAL);
      let result;
      service.getRememberOnDevice().then(r => result = r);
      tick();
      expect(result).toBe(true);
      expect(setSpy).not.toHaveBeenCalled();
      expect(window.localStorage.getItem).toHaveBeenCalledWith(NgxFirebaseAuthService.persistenceStorageKey);
    }));

    it('should resolve with false if the stored value is session', fakeAsync(() => {
      storageGetSpy.and.callFake(() => auth.Auth.Persistence.SESSION);
      let result;
      service.getRememberOnDevice().then(r => result = r);
      tick();
      expect(result).toBe(false);
      expect(setSpy).not.toHaveBeenCalled();
      expect(window.localStorage.getItem).toHaveBeenCalledWith(NgxFirebaseAuthService.persistenceStorageKey);
    }));

    it('should resolve with true if the stored value is null, after setting the storage value', fakeAsync(() => {
      storageGetSpy.and.callFake(() => null);
      let result;
      service.getRememberOnDevice().then(r => result = r);
      tick();
      expect(result).toBe(true);
      expect(setSpy).toHaveBeenCalledWith(true);
      expect(window.localStorage.getItem).toHaveBeenCalledWith(NgxFirebaseAuthService.persistenceStorageKey);
    }));
    it('should reject if the stored value is null and service.setRememberOnDevice fails', fakeAsync(() => {
      const error = {code: 'foo'};
      setSpy.and.callFake(() => Promise.reject(error));
      storageGetSpy.and.callFake(() => null);
      let rejected;
      service.getRememberOnDevice().catch(e => rejected = e);
      tick();
      expect(rejected).toBe(error);
    }));
  });

  describe('uniqueId()', () => {
    it('should return a unique string', () => {
      expect(NgxFirebaseAuthService.uniqueId()).toEqual(jasmine.any(String));
      expect(NgxFirebaseAuthService.uniqueId()).not.toEqual(NgxFirebaseAuthService.uniqueId());
    });
  });

  describe('fetchSignInMethodsForEmail', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = jasmine.createSpy();
      spyOnProperty(service, 'auth').and.returnValue({fetchSignInMethodsForEmail: apiSpy});
    });
    it('should resolve after making the api call', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve([]));
      let resolved;
      service.fetchSignInMethodsForEmail('foo@bar.com').then(r => resolved = r);
      expect(apiSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(resolved).toEqual([]);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      let rejected;
      service.fetchSignInMethodsForEmail('foo@bar.com').catch(e => rejected = e);
      expect(apiSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(rejected).toEqual({code: 'foo'});
    }));
  });

  describe('handleOob(queryParams)', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = jasmine.createSpy();
      spyOnProperty(service, 'auth').and.returnValue({checkActionCode: apiSpy});
    });
    it('should resolve correctly if there is no mode in the queryParams', fakeAsync(() => {
      const queryParams = {oobCode: 'oob-code'};
      let resolved;
      service.handleOob(queryParams).then(r => resolved = r);
      tick();
      expect(apiSpy).not.toHaveBeenCalled();
      expect(resolved.error.code).toBe('ngx-fire-auth/missing-oob-parameters');
      expect(resolved.code).toBe('oob-code');
      expect(resolved.mode).toBe(null);
      expect(resolved.email).toBe(null);
      expect(resolved.fromEmail).toBe(null);
    }));
    it('should resolve correctly if there is an unrecognized mode in the queryParams', fakeAsync(() => {
      const queryParams = {oobCode: 'oob-code', mode: 'fooBar'};
      let resolved;
      service.handleOob(queryParams).then(r => resolved = r);
      tick();
      expect(apiSpy).not.toHaveBeenCalled();
      expect(resolved.error.code).toBe('ngx-fire-auth/missing-oob-parameters');
      expect(resolved.code).toBe('oob-code');
      expect(resolved.mode).toBe(null);
      expect(resolved.email).toBe(null);
      expect(resolved.fromEmail).toBe(null);
    }));
    it('should resolve correctly if there is no oobCode in the queryParams', fakeAsync(() => {
      const queryParams = {mode: 'resetPassword'};
      let resolved;
      service.handleOob(queryParams).then(r => resolved = r);
      tick();
      expect(apiSpy).not.toHaveBeenCalled();
      expect(resolved.error.code).toBe('ngx-fire-auth/missing-oob-parameters');
      expect(resolved.code).toBe(null);
      expect(resolved.mode).toBe('resetPassword');
      expect(resolved.email).toBe(null);
      expect(resolved.fromEmail).toBe(null);
    }));
    it('should resolve correctly if checkActionCode fails', fakeAsync(() => {
      const queryParams = {mode: 'resetPassword', oobCode: 'oob-code'};
      const error = {code: 'foo'};
      let resolved;
      apiSpy.and.callFake(() => Promise.reject(error));
      service.handleOob(queryParams).then(r => resolved = r);
      tick();
      expect(apiSpy).toHaveBeenCalledWith('oob-code');
      expect(resolved.error).toBe(error);
      expect(resolved.code).toBe('oob-code');
      expect(resolved.mode).toBe('resetPassword');
      expect(resolved.email).toBe(null);
      expect(resolved.fromEmail).toBe(null);
    }));
    it('should resolve correctly if the api call succeeds (resetEmail)', fakeAsync(() => {
      const info = {operation:  'PASSWORD_RESET', data: {email: 'foo@bar.com'}};
      const queryParams = {mode: 'resetPassword', oobCode: 'oob-code'};
      let resolved;
      apiSpy.and.callFake(() => Promise.resolve(info));
      service.handleOob(queryParams).then(r => resolved = r);
      tick();
      expect(apiSpy).toHaveBeenCalledWith('oob-code');
      expect(resolved.error).toBe(null);
      expect(resolved.code).toBe('oob-code');
      expect(resolved.mode).toBe('resetPassword');
      expect(resolved.email).toBe('foo@bar.com');
      expect(resolved.fromEmail).toBe(null);
    }));
    it('should resolve correctly if the api call succeeds (verifyEmail)', fakeAsync(() => {
      const info = {operation:  'VERIFY_EMAIL', data: {email: 'foo@bar.com'}};
      const queryParams = {mode: 'verifyEmail', oobCode: 'oob-code'};
      let resolved;
      apiSpy.and.callFake(() => Promise.resolve(info));
      service.handleOob(queryParams).then(r => resolved = r);
      tick();
      expect(apiSpy).toHaveBeenCalledWith('oob-code');
      expect(resolved.error).toBe(null);
      expect(resolved.code).toBe('oob-code');
      expect(resolved.mode).toBe('verifyEmail');
      expect(resolved.email).toBe('foo@bar.com');
      expect(resolved.fromEmail).toBe(null);
    }));
    it('should resolve correctly if the api call succeeds (recoverEmail)', fakeAsync(() => {
      const info = {operation:  'RECOVER_EMAIL', data: {email: 'foo@bar.com', fromEmail: 'bar@foo.com'}};
      const queryParams = {mode: 'recoverEmail', oobCode: 'oob-code'};
      let resolved;
      apiSpy.and.callFake(() => Promise.resolve(info));
      service.handleOob(queryParams).then(r => resolved = r);
      tick();
      expect(apiSpy).toHaveBeenCalledWith('oob-code');
      expect(resolved.error).toBe(null);
      expect(resolved.code).toBe('oob-code');
      expect(resolved.mode).toBe('recoverEmail');
      expect(resolved.email).toBe('foo@bar.com');
      expect(resolved.fromEmail).toBe('bar@foo.com');
    }));
  });

  describe('applyActionCode(oobCode)', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = jasmine.createSpy();
      spyOnProperty(service, 'auth').and.returnValue({applyActionCode: apiSpy});
    });
    it('should resolve after making the api call', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve());
      let resolved;
      service.applyActionCode('oob').then(r => resolved = true);
      expect(apiSpy).toHaveBeenCalledWith('oob');
      tick();
      expect(resolved).toEqual(true);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      let rejected;
      service.applyActionCode('oob').catch(e => rejected = e);
      expect(apiSpy).toHaveBeenCalledWith('oob');
      tick();
      expect(rejected).toEqual({code: 'foo'});
    }));
  });

  describe('sendEmailVerification(user)', () => {
    let apiSpy;
    let user;
    beforeEach(() => {
      apiSpy = jasmine.createSpy();
      user = {sendEmailVerification: apiSpy};
    });
    it('should resolve after making the api call', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve());
      let resolved;
      service.sendEmailVerification(user).then(r => resolved = true);
      expect(apiSpy).toHaveBeenCalledWith();
      tick();
      expect(resolved).toEqual(true);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      let rejected;
      service.sendEmailVerification(user).catch(e => rejected = e);
      expect(apiSpy).toHaveBeenCalledWith();
      tick();
      expect(rejected).toEqual({code: 'foo'});
    }));
  });

  describe('sendPasswordResetEmail(email)', () => {
    let apiSpy;
    beforeEach(() => {
      apiSpy = jasmine.createSpy();
      spyOnProperty(service, 'auth').and.returnValue({sendPasswordResetEmail: apiSpy});
    });
    it('should resolve after making the api call', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve());
      let resolved;
      service.sendPasswordResetEmail('foo@bar.com').then(r => resolved = true);
      expect(apiSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(resolved).toEqual(true);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      let rejected;
      service.sendPasswordResetEmail('foo@bar.com').catch(e => rejected = e);
      expect(apiSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(rejected).toEqual({code: 'foo'});
    }));
  });


  describe('confirmPasswordReset(oobCode, email, password)', () => {
    let apiSpy;
    let signInSpy;
    let cred;
    beforeEach(() => {
      cred = {};
      signInSpy = spyOn(service, 'signInWithPassword').and.callFake(() => Promise.resolve(cred));
      apiSpy = jasmine.createSpy();
      spyOnProperty(service, 'auth').and.returnValue({confirmPasswordReset: apiSpy});
    });
    it('should resolve after making the api calls', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve());
      let resolved;
      service.confirmPasswordReset('oob', 'foo@bar.com', 'password').then(r => resolved = r);
      expect(apiSpy).toHaveBeenCalledWith('oob', 'password');
      tick();
      expect(signInSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(resolved).toEqual(cred);
    }));
    it('should reject if the api call fails', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      let rejected;
      service.confirmPasswordReset('oob', 'foo@bar.com', 'password').catch(e => rejected = e);
      expect(apiSpy).toHaveBeenCalledWith('oob', 'password');
      tick();
      expect(signInSpy).not.toHaveBeenCalled();
      expect(rejected).toEqual({code: 'foo'});
    }));
    it('should reject if the sign in call fails', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve());
      signInSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      let rejected;
      service.confirmPasswordReset('oob', 'foo@bar.com', 'password').catch(e => rejected = e);
      expect(apiSpy).toHaveBeenCalledWith('oob', 'password');
      tick();
      expect(signInSpy).toHaveBeenCalled();
      expect(rejected).toEqual({code: 'foo'});
    }));
  });

});
