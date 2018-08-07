import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import { OauthSignInComponent } from './oauth-sign-in.component';

import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute, NGX_FIREBASE_AUTH_OPTIONS
} from '../shared';
describe('OauthSignInComponent', () => {
  let component: OauthSignInComponent;
  let fixture: ComponentFixture<OauthSignInComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OauthSignInComponent ],
      providers: [
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(OauthSignInComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(OauthSignInComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have options', () => {
    expect(component.options).toBeTruthy();
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
  it('should have router', () => {
    expect(component.router).toBeTruthy();
  });
  it('should have queryParams', () => {
    expect(component.queryParams).toBeTruthy();
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

  describe('getProvider(providerId)', () => {
    describe('when options.authProviderFactory is not set', () => {
      beforeEach(() => {
        spyOnProperty(component, 'options').and.returnValue({});
      });
      it('should return the right thing for twitter.com', () => {
        expect(component.getProvider('twitter.com').providerId).toBe('twitter.com');
      });
      it('should return the right thing for facebook.com', () => {
        expect(component.getProvider('facebook.com').providerId).toBe('facebook.com');
      });
      it('should return the right thing for github.com', () => {
        expect(component.getProvider('github.com').providerId).toBe('github.com');
      });
      it('should return the right thing for google.com', () => {
        expect(component.getProvider('google.com').providerId).toBe('google.com');
      });
      it('should return null for example.com', () => {
        expect(component.getProvider('example.com')).toBe(null);
      });
    });
    describe('when options.authProviderFactory is set', () => {
      let factorySpy;
      let provider;
      beforeEach(() => {
        provider = {};
        factorySpy = jasmine.createSpy().and.callFake(() => provider);
        spyOnProperty(component, 'options').and.returnValue({
          authProviderFactory: factorySpy
        });
      });
      it('should return the provider', () => {
        expect(component.getProvider('twitter.com')).toBe(provider);
      });
      it('should call the factory', () => {
        component.getProvider('twitter.com');
        expect(factorySpy).toHaveBeenCalledWith('twitter.com');
      });
    });

  });

  describe('ngOnInit', () => {
    let handleRedirectSpy;
    let submitSpy;
    let setRouteSpy;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      handleRedirectSpy = spyOn(component, 'handleRedirect').and.callFake(() => Promise.resolve(false));
      submitSpy = spyOn(component, 'submit').and.callFake(() => {});
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
    });
    it('should set the route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.oAuthSignIn);
    });
    it('should call handleRedirect', () => {
      component.ngOnInit();
      expect(handleRedirectSpy).toHaveBeenCalled();
    });
    it('should not call submit if handleRedirect returns true', fakeAsync(() => {
      handleRedirectSpy.and.callFake(() => Promise.resolve(true));
      component.ngOnInit();
      tick();
      expect(submitSpy).not.toHaveBeenCalled();
    }));
    it('should not call submit if handleRedirect returns false but there is no providerId queryParam', fakeAsync(() => {
      handleRedirectSpy.and.callFake(() => Promise.resolve(false));
      spyOnProperty(component, 'queryParams').and.returnValue({});
      component.ngOnInit();
      tick();
      expect(submitSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('form');
    }));
    it('should call submit if handleRedirect returns false and there is a providerId queryParam', fakeAsync(() => {
      handleRedirectSpy.and.callFake(() => Promise.resolve(false));
      spyOnProperty(component, 'queryParams').and.returnValue({providerId: 'twitter.com'});
      component.ngOnInit();
      tick();
      expect(submitSpy).toHaveBeenCalledWith('twitter.com');
    }));

  });

  describe('handleRedirect', () => {

    let cred;
    let getRedirectResultSpy;
    let onErrorSpy;
    let onSuccessSpy;
    beforeEach(() => {

      cred = {user: {}};
      getRedirectResultSpy = jasmine.createSpy();
      onErrorSpy = spyOn(component, 'onError').and.callFake(() => {});
      onSuccessSpy = spyOn(component, 'onSuccess').and.callFake(() => {});
      spyOnProperty(component, 'auth').and.returnValue({
        getRedirectResult: getRedirectResultSpy,
      });
    });
    it('should resolve with true if there is redirect result', fakeAsync(() => {
      let resolved;
      getRedirectResultSpy.and.callFake(() => Promise.resolve(cred));
      component.handleRedirect().then(r => resolved = r );
      expect(getRedirectResultSpy).toHaveBeenCalledWith();
      tick();
      expect(resolved).toBe(true);
      expect(onSuccessSpy).toHaveBeenCalledWith(cred);
    }));
    it('should resolve with false if there is no redirect result', fakeAsync(() => {
      let resolved;
      getRedirectResultSpy.and.callFake(() => Promise.resolve({user: null}));
      component.handleRedirect().then(r => resolved = r );
      expect(getRedirectResultSpy).toHaveBeenCalledWith();
      tick();
      expect(resolved).toBe(false);
      expect(onSuccessSpy).not.toHaveBeenCalled();
    }));
    it('should resolve with true if there is an error', fakeAsync(() => {
      let resolved;
      const error = {};
      getRedirectResultSpy.and.callFake(() => Promise.reject(error));
      component.handleRedirect().then(r => resolved = r );
      expect(getRedirectResultSpy).toHaveBeenCalledWith();
      tick();
      expect(resolved).toBe(true);
      expect(onErrorSpy).toHaveBeenCalledWith(error);
    }));
  });

  describe('submit(providerId)', () => {
    let cred;
    let provider;
    let getProviderSpy;
    let signInWithPopupSpy;
    let signInWithRedirectSpy;
    let onErrorSpy;
    let onSuccessSpy;
    beforeEach(() => {
      cred = {};
      provider = {};
      getProviderSpy = spyOn(component, 'getProvider').and.callFake(() => provider);
      signInWithPopupSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      signInWithRedirectSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        signInWithPopup: signInWithPopupSpy,
        signInWithRedirect: signInWithRedirectSpy,
      });
      onErrorSpy = spyOn(component, 'onError').and.callFake(() => {});
      onSuccessSpy = spyOn(component, 'onSuccess').and.callFake(() => {});
    });
    it('should bail if the provider is null', () => {
      getProviderSpy.and.callFake(() => null);
      component.submit('foobar.com');
      expect(onErrorSpy).toHaveBeenCalledWith(jasmine.any(Object));
      expect(signInWithPopupSpy).not.toHaveBeenCalled();
      expect(signInWithRedirectSpy).not.toHaveBeenCalled();
    });
    it('should call signInWithPopup if popup is the method', () => {
      component.authService.oAuthMethod = NgxFirebaseAuthOAuthMethod.popup;
      component.submit('twitter.com');
      expect(signInWithPopupSpy).toHaveBeenCalledWith(provider);
    });
    it('should call signInWithRedirect if redirect is the method', () => {
      component.authService.oAuthMethod = NgxFirebaseAuthOAuthMethod.redirect;
      component.submit('twitter.com');
      expect(signInWithRedirectSpy).toHaveBeenCalledWith(provider);
    });
    it('should set currentProviderId', () => {
      component.currentProviderId = null;
      component.submit('twitter.com');
      expect(component.currentProviderId).toBe('twitter.com');
    });
    it('should set screen to wait', () => {
      component.screen = 'error';
      component.submit('twitter.com');
      expect(component.screen).toBe('wait');
    });
    it('should set error to null', () => {
      component.error = {} as any;
      component.submit('twitter.com');
      expect(component.error).toBe(null);
    });
    it('should call onSuccess if popup succeeds', fakeAsync(() => {
      component.authService.oAuthMethod = NgxFirebaseAuthOAuthMethod.popup;
      component.submit('twitter.com');
      expect(signInWithPopupSpy).toHaveBeenCalledWith(provider);
      tick();
      expect(onSuccessSpy).toHaveBeenCalledWith(cred);
    }));
    it('should call onError if popup fails', fakeAsync(() => {
      const error = {code: 'foo'};
      signInWithPopupSpy.and.callFake(() => Promise.reject(error));
      component.authService.oAuthMethod = NgxFirebaseAuthOAuthMethod.popup;
      component.submit('twitter.com');
      expect(signInWithPopupSpy).toHaveBeenCalledWith(provider);
      tick();
      expect(onErrorSpy).toHaveBeenCalledWith(error);
    }));

    it('should call onError if redirect fails', fakeAsync(() => {
      const error = {code: 'foo'};
      signInWithRedirectSpy.and.callFake(() => Promise.reject(error));
      component.authService.oAuthMethod = NgxFirebaseAuthOAuthMethod.redirect;
      component.submit('twitter.com');
      expect(signInWithRedirectSpy).toHaveBeenCalledWith(provider);
      tick();
      expect(onErrorSpy).toHaveBeenCalledWith(error);
    }));

  });

  describe('onSuccess(cred)', () => {
    let pushCredSpy;
    let navSpy;
    let cred;
    let getIndexRouterLinkSpy;
    let signInWithCredentialSpy;
    beforeEach(() => {
      signInWithCredentialSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      cred = {user: {}, credential: {}};
      pushCredSpy = jasmine.createSpy();
      navSpy = jasmine.createSpy();
      getIndexRouterLinkSpy = jasmine.createSpy().and.callFake(() => ['/', 'auth']);
      spyOnProperty(component, 'authService').and.returnValue({
        redirectCancelled: true,
        pushCred: pushCredSpy,
        getIndexRouterLink: getIndexRouterLinkSpy
      });
      spyOnProperty(component, 'router').and.returnValue({
        navigate: navSpy
      });
      spyOnProperty(component, 'auth').and.returnValue({
        signInAndRetrieveDataWithCredential: signInWithCredentialSpy
      });
    });
    it('should push cred', fakeAsync(() => {
      component.onSuccess(cred);
      expect(signInWithCredentialSpy).toHaveBeenCalledWith(cred.credential);
      tick();
      expect(pushCredSpy).toHaveBeenCalledWith(cred);
    }));
    it('should not navigate if the redirect is cancelled', fakeAsync(() => {
      component.authService.redirectCancelled = true;
      component.onSuccess(cred);
      tick();
      expect(navSpy).not.toHaveBeenCalled();
    }));
    it('should navigate if the redirect is not cancelled', fakeAsync(() => {
      component.authService.redirectCancelled = false;
      component.onSuccess(cred);
      tick();
      expect(navSpy).toHaveBeenCalledWith(getIndexRouterLinkSpy.calls.mostRecent().returnValue);
    }));
  });


  describe('onError(error)', () => {
    let fetchSignInMethodsForEmailSpy;
    beforeEach(() => {
      fetchSignInMethodsForEmailSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(['password', 'github.com']));
      spyOnProperty(component, 'auth').and.returnValue({fetchSignInMethodsForEmail: fetchSignInMethodsForEmailSpy});
    });
    it('should handle an error that has an email', fakeAsync(() => {
      const error: any = {code: 'auth/foo', email: 'foo@bar.com'};
      component.onError(error);
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.screen).toBe('accountExistsError');
      expect(component.signInMethodsForEmail).toEqual(['password', 'github.com']);
      expect(component.error).toBe(error);
    }));
    it('should handle auth/popup-blocked', () => {
      const error: any = {code: 'auth/popup-blocked'};
      component.onError(error);
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('popupBlockedError');
      expect(component.signInMethodsForEmail).toEqual(null);
      expect(component.error).toBe(error);
    });

    it('should handle auth/popup-closed-by-user', () => {
      const error: any = {code: 'auth/popup-closed-by-user'};
      component.onError(error);
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('popupCancelledError');
      expect(component.signInMethodsForEmail).toEqual(null);
      expect(component.error).toBe(error);
    });

    it('should handle auth/foo', () => {
      const error: any = {code: 'auth/foo'};
      component.onError(error);
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('error');
      expect(component.signInMethodsForEmail).toEqual(null);
      expect(component.error).toBe(error);
    });



  });
});
