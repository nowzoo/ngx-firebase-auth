import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { SignInComponent } from './sign-in.component';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: Router, useValue: {}},
        {provide: ActivatedRoute, useValue: {queryParams: new BehaviorSubject({}), snapshot: {queryParams: {}}}},
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
    it('should have snapshotQueryParams', () => {
      expect(component.snapshotQueryParams).toBeTruthy();
    });
    it('should have queryParams', () => {
      expect(component.queryParams).toBeTruthy();
    });
  });

  describe('ngOnInit()', () => {
    it('should call init()', () => {
      spyOn(component, 'init').and.callFake(() => {});
      component.ngOnInit();
      expect(component.init).toHaveBeenCalled();
    });
  });


  describe('showSignOut()', () => {
    let signOutSpy;
    let showSignInSpy;
    beforeEach(() => {
      component.screen = 'signIn';
      signOutSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      showSignInSpy = spyOn(component, 'showSignIn').and.callFake(() => {});
      spyOnProperty(component, 'auth').and.returnValue({
        signOut: signOutSpy
      });
    });
    it('should set the screens and make the right calls', fakeAsync(() => {
      component.showSignOut();
      expect(component.screen).toBe('wait');
      tick();
      expect(showSignInSpy).toHaveBeenCalledWith(true);
    }));
  });

  describe('showSignIn(signedOut)', () => {
    it('should set screen', () => {
      component.showSignIn();
      expect(component.screen).toBe('signIn');
    });
    it('should set signedOut if passed nothing', () => {
      component.showSignIn();
      expect(component.signedOut).toBe(false);
    });
    it('should set signedOut if passed false', () => {
      component.showSignIn(false);
      expect(component.signedOut).toBe(false);
    });
    it('should set signedOut if passed true', () => {
      component.showSignIn(true);
      expect(component.signedOut).toBe(true);
    });
  });

  describe('showSignInPassword()', () => {
    it('should set screen', () => {
      component.showSignInPassword();
      expect(component.screen).toBe('signInPassword');
    });
  });
  describe('showSignUpPassword()', () => {
    it('should set screen', () => {
      component.showSignUpPassword();
      expect(component.screen).toBe('signUpPassword');
    });
  });

  describe('showResetPassword()', () => {
    it('should set screen', () => {
      component.showResetPassword();
      expect(component.screen).toBe('resetPassword');
    });
  });

  describe('showUnhandledError(err)', () => {
    it('should set error', () => {
      component.unhandledError = null;
      component.showUnhandledError({code: 'foo', message: 'bar'});
      expect(component.unhandledError).toEqual({code: 'foo', message: 'bar'});
    });
    it('should set screen', () => {
      component.showUnhandledError({code: 'foo', message: 'bar'});
      expect(component.screen).toBe('unhandledError');
    });
  });

  describe('showSignInSuccess(cred)', () => {
    beforeEach(() => {
      spyOn(component.success, 'emit').and.callThrough();
    });
    it('should set cred', () => {
      component.cred = null;
      component.showSignInSuccess({user: {}} as any);
      expect(component.cred).toEqual({user: {}});
    });
    it('should set screen', () => {
      component.showSignInSuccess({user: {}} as any);
      expect(component.screen).toBe('signInSuccess');
    });
    it('should emit cred', () => {
      component.showSignInSuccess({user: {}} as any);
      expect(component.success.emit).toHaveBeenCalledWith({user: {}});
    });
  });

  describe('showSignInOAuth(oAuthProviderId: string, error: auth.Error)', () => {
    it('should set screen', () => {
      component.showSignInOAuth('twitter.com', null);
      expect(component.screen).toBe('signInOAuth');
    });
    it('should set oAuthProviderId', () => {
      component.showSignInOAuth('twitter.com', null);
      expect(component.oAuthProviderId).toBe('twitter.com');
    });
    it('should set initialOAuthError', () => {
      component.showSignInOAuth('twitter.com', {} as any);
      expect(component.initialOAuthError).toEqual({});
    });
  });

  describe('onInitHandleSignOut()', () => {
    let result;
    beforeEach(() => {
      result = undefined;
      spyOn(component, 'showSignOut').and.callFake(() => Promise.resolve());
    });
    it('should resolve with false if action is not signOut', fakeAsync(() => {
      spyOnProperty(component, 'snapshotQueryParams').and.returnValue({});
      component.onInitHandleSignOut().then(r => result = r);
      tick();
      expect(result).toBe(false);
      expect(component.showSignOut).not.toHaveBeenCalled();
    }));
    it('should resolve with true if action is signOut', fakeAsync(() => {
      spyOnProperty(component, 'snapshotQueryParams').and.returnValue({action: 'signOut'});
      component.onInitHandleSignOut().then(r => result = r);
      tick();
      expect(result).toBe(true);
      expect(component.showSignOut).toHaveBeenCalled();
    }));
  });
  describe('onInitHandleOAuthRedirect()', () => {
    let result;
    let getRedirectResultSpy;
    let cred;
    let showSignInSuccessSpy;
    let showSignInOAuthSpy;
    let setRememberedSpy;
    beforeEach(() => {
      result = undefined;
      cred = {user: {}};
      getRedirectResultSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      setRememberedSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());

      spyOnProperty(component, 'authService').and.returnValue({
        setRemembered: setRememberedSpy,
      });
      showSignInSuccessSpy = spyOn(component, 'showSignInSuccess').and.callFake(() => {});
      showSignInOAuthSpy = spyOn(component, 'showSignInOAuth').and.callFake(() => {});
    });

    it('should show success if the cred contains a user and auth.currentUser', fakeAsync(() => {
      spyOnProperty(component, 'auth').and.returnValue({
        getRedirectResult: getRedirectResultSpy,
        currentUser: {}
      });
      component.onInitHandleOAuthRedirect().then(r => result = r);
      tick();
      expect(showSignInSuccessSpy).toHaveBeenCalledWith(cred);
    }));
    it('should resolve with true if cred contains a user and auth.currentUser', fakeAsync(() => {
      spyOnProperty(component, 'auth').and.returnValue({
        getRedirectResult: getRedirectResultSpy,
        currentUser: {}
      });
      component.onInitHandleOAuthRedirect().then(r => result = r);
      tick();
      expect(result).toBe(true);
    }));
    it('should resolve with false if cred contains a user buth there is no auth.currentUser', fakeAsync(() => {
      spyOnProperty(component, 'auth').and.returnValue({
        getRedirectResult: getRedirectResultSpy,
        currentUser: null
      });
      component.onInitHandleOAuthRedirect().then(r => result = r);
      tick();
      expect(result).toBe(false);
    }));
    it('should resolve with false if cred does not contain a user', fakeAsync(() => {
      getRedirectResultSpy.and.callFake(() => Promise.resolve({user: null}));
      spyOnProperty(component, 'auth').and.returnValue({
        getRedirectResult: getRedirectResultSpy,
        currentUser: null
      });
      component.onInitHandleOAuthRedirect().then(r => result = r);
      tick();
      expect(result).toBe(false);
    }));

    it('should show sign in oauth if there is an error', fakeAsync(() => {
      getRedirectResultSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      spyOnProperty(component, 'auth').and.returnValue({
        getRedirectResult: getRedirectResultSpy,
        currentUser: null
      });
      component.onInitHandleOAuthRedirect().then(r => result = r);
      tick();
      expect(showSignInOAuthSpy).toHaveBeenCalledWith(null, {code: 'foo'});
    }));
    it('should resolve with true if there is an error', fakeAsync(() => {
      getRedirectResultSpy.and.callFake(() => Promise.reject({code: 'foo'}));
      spyOnProperty(component, 'auth').and.returnValue({
        getRedirectResult: getRedirectResultSpy,
        currentUser: null
      });
      component.onInitHandleOAuthRedirect().then(r => result = r);
      tick();
      expect(result).toBe(true);
    }));
  });

  describe('init()', () => {
    let getRememberedSpy;
    let onInitHandleSignOutSpy;
    let onInitHandleOAuthRedirectSpy;
    let queryParams$: BehaviorSubject<any>;
    beforeEach(() => {
      getRememberedSpy = jasmine.createSpy().and.callFake(() => ({remembered: true, email: 'foo@bar.com'}));
      spyOnProperty(component, 'authService').and.returnValue({
        getRemembered: getRememberedSpy
      });
      queryParams$ = new BehaviorSubject({});
      spyOnProperty(component, 'queryParams').and.returnValue(queryParams$.asObservable());
      onInitHandleSignOutSpy = spyOn(component, 'onInitHandleSignOut').and.callFake(() => Promise.resolve(false));
      onInitHandleOAuthRedirectSpy = spyOn(component, 'onInitHandleOAuthRedirect').and.callFake(() => Promise.resolve(false));
      spyOn(component, 'showSignOut').and.callFake(() => {});
      spyOn(component, 'showSignIn').and.callFake(() => {});
      spyOn(component, 'showSignInPassword').and.callFake(() => {});
      spyOn(component, 'showSignUpPassword').and.callFake(() => {});
      spyOn(component, 'showSignInOAuth').and.callFake(() => {});
      spyOn(component, 'showResetPassword').and.callFake(() => {});
    });
    it('should show various screens after initialization when queryParams change', fakeAsync(() => {
      component.init();
      tick();
      expect(component.showSignIn).toHaveBeenCalledTimes(1);
      queryParams$.next({action: 'signOut'});
      expect(component.showSignOut).toHaveBeenCalledTimes(1);
      queryParams$.next({action: 'signInPassword'});
      expect(component.showSignInPassword).toHaveBeenCalledTimes(1);
      queryParams$.next({action: 'signUpPassword'});
      expect(component.showSignUpPassword).toHaveBeenCalledTimes(1);
      queryParams$.next({action: 'signInOAuth', providerId: 'foo'});
      expect(component.showSignInOAuth).toHaveBeenCalledTimes(1);
      queryParams$.next({action: 'resetPassword'});
      expect(component.showResetPassword).toHaveBeenCalledTimes(1);
      queryParams$.next({action: 'signIn'});
      expect(component.showSignIn).toHaveBeenCalledTimes(2);
    }));
    it('should work if onInitHandleSignOut resolves with false', fakeAsync(() => {
      onInitHandleSignOutSpy.and.callFake(() => Promise.resolve(false));
      component.init();
      tick();
      expect(onInitHandleSignOutSpy).toHaveBeenCalled();
      expect(onInitHandleOAuthRedirectSpy).toHaveBeenCalled();
    }));
    it('should work if onInitHandleSignOut resolves with true', fakeAsync(() => {
      onInitHandleSignOutSpy.and.callFake(() => Promise.resolve(true));
      component.init();
      tick();
      expect(onInitHandleSignOutSpy).toHaveBeenCalled();
      expect(onInitHandleOAuthRedirectSpy).not.toHaveBeenCalled();
    }));
  });

});
