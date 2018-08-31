import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { SignInOauthComponent } from './sign-in-oauth.component';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

describe('SignInOauthComponent', () => {
  let component: SignInOauthComponent;
  let fixture: ComponentFixture<SignInOauthComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInOauthComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: Router, useValue: {}},
        {provide: ActivatedRoute, useValue: {}},

      ]
    })
    .overrideTemplate(SignInOauthComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(SignInOauthComponent);
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
    it('should have route', () => {
      expect(component.route).toBeTruthy();
    });
    it('should have router', () => {
      expect(component.router).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    let rememberChangeSpy;
    let handleOAuthErrorSpy;
    let oAuthSignInSpy;
    beforeEach(() => {
      component.email = 'foo@bar.com';
      component.remember = true;
      rememberChangeSpy = spyOn(component.rememberChange, 'emit').and.callThrough();
      handleOAuthErrorSpy = spyOn(component, 'handleOAuthError').and.callFake(() => {});
      oAuthSignInSpy = spyOn(component, 'oAuthSignIn').and.callFake(() => {});
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
      expect(component.rememberFc.value).toBe(component.remember);
      expect(component.fg.get('remember')).toBe(component.rememberFc);
    });
    it('should call handleOAuthError if the error is set', () => {
      component.initialError = {code: 'foo', message: 'bar'};
      component.ngOnInit();
      expect(handleOAuthErrorSpy).toHaveBeenCalledWith(component.initialError);
    });
    it('should call oAuthSignIn if the error is not set', () => {
      component.initialError = null;
      component.providerId = 'foo';
      component.ngOnInit();
      expect(handleOAuthErrorSpy).not.toHaveBeenCalled();
      expect(oAuthSignInSpy).toHaveBeenCalledWith('foo');
    });
  });

  describe('getOAuthProvider(id)', () => {
    it('should return the result of oAuthProviderFactory, if set', fakeAsync(() => {
      const providerFromFunc = {};
      const oAuthProviderFactorySpy = jasmine.createSpy().and.callFake(() => providerFromFunc);
      component.oAuthProviderFactory = oAuthProviderFactorySpy;
      let result;
      component.getOAuthProvider('twitter.com')
        .then((p) => result = p);
      tick();
      expect(result).toBe(providerFromFunc);
      expect(oAuthProviderFactorySpy).toHaveBeenCalledWith('twitter.com');
    }));
    it('should return something even if oAuthProviderFactory returns undefined', fakeAsync(() => {
      const oAuthProviderFactorySpy = jasmine.createSpy().and.callFake(() => {});
      component.oAuthProviderFactory = oAuthProviderFactorySpy;
      let result;
      component.getOAuthProvider('twitter.com')
        .then((p) => result = p);
      tick();
      expect(result).toBeTruthy();
      expect(oAuthProviderFactorySpy).toHaveBeenCalledWith('twitter.com');
    }));
    it('should return a truthy value for twitter.com', fakeAsync(() => {
      let result;
      component.getOAuthProvider('twitter.com')
        .then((p) => result = p);
      tick();
      expect(result).toBeTruthy();
      expect(result.providerId).toBe('twitter.com');
    }));
    it('should return a truthy value for google.com', fakeAsync(() => {
      let result;
      component.getOAuthProvider('google.com')
        .then((p) => result = p);
      tick();
      expect(result).toBeTruthy();
      expect(result.providerId).toBe('google.com');
    }));
    it('should return a truthy value for facebook.com', fakeAsync(() => {
      let result;
      component.getOAuthProvider('facebook.com')
        .then((p) => result = p);
      tick();
      expect(result).toBeTruthy();
      expect(result.providerId).toBe('facebook.com');
    }));
    it('should return a truthy value for github.com', fakeAsync(() => {
      let result;
      component.getOAuthProvider('github.com')
        .then((p) => result = p);
      tick();
      expect(result).toBeTruthy();
      expect(result.providerId).toBe('github.com');
    }));
    it('should reject if passed an unknown id', fakeAsync(() => {
      let result;
      component.getOAuthProvider('unknown')
        .catch((p) => result = p);
      tick();
      expect(result).toBeTruthy();
      expect(result.code).toBe('ngx-firebase-auth/no-provider-found');
    }));
  });

  describe('handleOAuthError', () => {
    let errorEmitSpy;
    let emailChangeSpy;
    let oAuthSignInSpy;
    let fetchSignInMethodsForEmailSpy;
    beforeEach(() => {
      fetchSignInMethodsForEmailSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(['twitter.com']));
      spyOnProperty(component, 'auth').and.returnValue({
        fetchSignInMethodsForEmail: fetchSignInMethodsForEmailSpy
      });
      errorEmitSpy = spyOn(component.error, 'emit').and.callThrough();
      emailChangeSpy = spyOn(component.emailChange, 'emit').and.callThrough();
      oAuthSignInSpy = spyOn(component, 'oAuthSignIn').and.callFake(() => {});
    });
    it('should handle the case where the error has an email', fakeAsync(() => {
      const error = {email: 'foo@bar.com', credential: {}, code: 'doesnt-matter'} as any;
      component.handleOAuthError(error);
      tick();
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith(error.email);
      expect(error.methods).toEqual(['twitter.com']);
      expect(component.methodError).toBe(error);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should do nothing if error is auth/cancelled-popup-request', fakeAsync(() => {
      const error = {code: 'auth/cancelled-popup-request'} as any;
      component.handleOAuthError(error);
      tick();
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should do nothing if error is auth/popup-closed-by-user', fakeAsync(() => {
      const error = {code: 'auth/popup-closed-by-user'} as any;
      component.handleOAuthError(error);
      tick();
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should sign in with redirect if error is auth/popup-blocked', fakeAsync(() => {
      const error = {code: 'auth/popup-blocked'} as any;
      component.handleOAuthError(error, 'foo');
      tick();
      expect(errorEmitSpy).not.toHaveBeenCalled();
      expect(oAuthSignInSpy).toHaveBeenCalledWith('foo', true);
    }));
    it('should emit error with anything else', () => {
      const error = {code: 'auth/foo'} as any;
      component.handleOAuthError(error);
      expect(errorEmitSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('oAuthSignIn(id, forceRedirect?)', () => {
    let authProvider;
    let cred;
    let signInWithPopupSpy;
    let signInWithRedirectSpy;
    let setRememberedSpy;
    let getOAuthProviderSpy;
    let successSpy;
    let handleOAuthErrorSpy;
    let navigateSpy;
    beforeEach(() => {
      component.rememberFc = new FormControl(true);
      cred = {user: {email: 'foo@bar.com'}};
      authProvider = {};
      signInWithPopupSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      signInWithRedirectSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      setRememberedSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      navigateSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        signInWithPopup: signInWithPopupSpy,
        signInWithRedirect: signInWithRedirectSpy
      });
      spyOnProperty(component, 'authService').and.returnValue({
        setRemembered: setRememberedSpy
      });
      spyOnProperty(component, 'router').and.returnValue({
        navigate: navigateSpy
      });
      getOAuthProviderSpy = spyOn(component, 'getOAuthProvider').and.callFake(() => Promise.resolve(authProvider));
      successSpy = spyOn(component.success, 'emit').and.callThrough();
      handleOAuthErrorSpy = spyOn(component, 'handleOAuthError').and.callFake(() => {});
    });
    it('should handle success if useOAuthPopup is false', fakeAsync(() => {
      component.useOAuthPopup = false;
      component.oAuthSignIn('twitter.com');
      tick();
      expect(navigateSpy).toHaveBeenCalledWith(['.'], {relativeTo: component.route, queryParams: {remember: true}});
      expect(getOAuthProviderSpy).toHaveBeenCalledWith('twitter.com');
      expect(signInWithRedirectSpy).toHaveBeenCalledWith(authProvider);
      expect(handleOAuthErrorSpy).not.toHaveBeenCalled();
    }));
    it('should handle success if useOAuthPopup is true, but force is true', fakeAsync(() => {
      component.useOAuthPopup = true;
      component.oAuthSignIn('twitter.com', true);
      tick();
      expect(navigateSpy).toHaveBeenCalledWith(['.'], {relativeTo: component.route, queryParams: {remember: true}});
      expect(getOAuthProviderSpy).toHaveBeenCalledWith('twitter.com');
      expect(signInWithRedirectSpy).toHaveBeenCalledWith(authProvider);
      expect(handleOAuthErrorSpy).not.toHaveBeenCalled();
    }));
    it('should handle an error if useOAuthPopup is false', fakeAsync(() => {
      signInWithRedirectSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      component.useOAuthPopup = false;
      component.oAuthSignIn('twitter.com');
      tick();
      expect(navigateSpy).toHaveBeenCalledWith(['.'], {relativeTo: component.route, queryParams: {remember: true}});
      expect(getOAuthProviderSpy).toHaveBeenCalledWith('twitter.com');
      expect(signInWithRedirectSpy).toHaveBeenCalledWith(authProvider);
      expect(handleOAuthErrorSpy).toHaveBeenCalledWith({code: 'foo'}, 'twitter.com');
    }));
    it('should handle success if useOAuthPopup is true', fakeAsync(() => {
      component.useOAuthPopup = true;
      component.oAuthSignIn('twitter.com');
      tick();
      expect(getOAuthProviderSpy).toHaveBeenCalledWith('twitter.com');
      expect(signInWithPopupSpy).toHaveBeenCalledWith(authProvider);
      expect(handleOAuthErrorSpy).not.toHaveBeenCalled();
      expect(setRememberedSpy).toHaveBeenCalledWith(true, 'foo@bar.com');
      expect(successSpy).toHaveBeenCalledWith(cred);
    }));

    it('should handle an error if useOAuthPopup is true', fakeAsync(() => {
      signInWithPopupSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      component.useOAuthPopup = true;
      component.oAuthSignIn('twitter.com');
      tick();
      expect(getOAuthProviderSpy).toHaveBeenCalledWith('twitter.com');
      expect(signInWithPopupSpy).toHaveBeenCalledWith(authProvider);
      expect(handleOAuthErrorSpy).toHaveBeenCalledWith({code: 'foo'}, 'twitter.com');
    }));
  });



});
