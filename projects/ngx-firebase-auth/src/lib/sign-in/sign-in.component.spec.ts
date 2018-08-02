import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import {
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS,
  ngxFirebaseAuthOAuthProviderNames
} from '../shared';

import { SignInComponent } from './sign-in.component';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInComponent ],
      providers: [
        { provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {methods: []} },
        { provide: NgxFirebaseAuthService, useValue: {} },
        { provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} }
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
    it('should have options', () => {
      expect(component.options).toBeTruthy();
    });
    it('should have authService', () => {
      expect(component.authService).toBeTruthy();
    });
    it('should have queryParams', () => {
      expect(component.queryParams).toBeTruthy();
    });

    it('should have methods', () => {
      expect(component.methods).toBeTruthy();
    });

    it('should have emailFromRoute', () => {
      expect(component.emailFromRoute).toBe('');
    });
  });

  describe('userExists getter', () => {
    it('should be true if methods.length > 0', () => {
      spyOnProperty(component, 'methods').and.returnValue(['password']);
      expect(component.userExists).toBe(true);
    });
    it('should be false if methods.length === 0', () => {
      spyOnProperty(component, 'methods').and.returnValue([]);
      expect(component.userExists).toBe(false);
    });
  });
  describe('userHasPassword getter', () => {
    it('should be true if methods has password', () => {
      spyOnProperty(component, 'methods').and.returnValue(['password']);
      expect(component.userHasPassword).toBe(true);
    });
    it('should be false if methods does not have password', () => {
      spyOnProperty(component, 'methods').and.returnValue(['twitter.com']);
      expect(component.userHasPassword).toBe(false);
    });
    it('should be false if methods.length === 0', () => {
      spyOnProperty(component, 'methods').and.returnValue([]);
      expect(component.userHasPassword).toBe(false);
    });
  });

  describe('userOAuthMethods getter', () => {
    it('should be empty if methods is empty', () => {
      spyOnProperty(component, 'methods').and.returnValue([]);
      expect(component.userOAuthMethods).toEqual([]);
    });
    it('should not return password', () => {
      spyOnProperty(component, 'methods').and.returnValue(['password']);
      expect(component.userOAuthMethods).toEqual([]);
    });
    it('should return the oauth methods', () => {
      spyOnProperty(component, 'methods').and.returnValue(['password', 'twitter.com', 'facebook.com']);
      expect(component.userOAuthMethods).toEqual(['twitter.com', 'facebook.com']);
    });
  });

  describe('passwordSignUpEnabled getter', () => {
    it('should be false if password is not in options.methods', () => {
      spyOnProperty(component, 'options').and.returnValue({methods: ['twitter.com']});
      expect(component.passwordSignUpEnabled).toBe(false);
    });
    it('should be true if password is in options.methods', () => {
      spyOnProperty(component, 'options').and.returnValue({methods: ['twitter.com', 'password']});
      expect(component.passwordSignUpEnabled).toBe(true);
    });
  });

  describe('oAuthSignUpMethodsEnabled getter', () => {
    it('should return an array excludeing password', () => {
      spyOnProperty(component, 'options').and.returnValue({methods: ['twitter.com', 'password', 'google.com']});
      expect(component.oAuthSignUpMethodsEnabled).toEqual(['twitter.com', 'google.com']);
    });
  });

  describe('setChildFormBusy(b)', () => {
    it('should set childFormBusy', () => {
      component.setChildFormBusy(true);
      expect(component.childFormBusy).toBe(true);
      component.setChildFormBusy(false);
      expect(component.childFormBusy).toBe(false);
    });
  });

  describe('showError(err)', () => {
    beforeEach(() => {
      component.unhandledError = null;
      component.screen = 'form';
    });
    it('should set screen to error', () => {
      const err: any = {};
      component.showError(err);
      expect(component.screen).toBe('error');
    });
    it('should set unhandledError', () => {
      const err: any = {};
      component.showError(err);
      expect(component.unhandledError).toBe(err);
    });
  });

  describe('showSuccess(cred)', () => {
    beforeEach(() => {
      component.cred = null;
      component.screen = 'form';
    });
    it('should set screen to success', () => {
      const cred: any = {};
      component.showSuccess(cred);
      expect(component.screen).toBe('success');
    });
    it('should set cred', () => {
      const cred: any = {};
      component.showSuccess(cred);
      expect(component.cred).toBe(cred);
    });
  });

  describe('showForm', () => {
    let onEmailValueSpy;
    beforeEach(() => {
      spyOnProperty(component, 'emailFromRoute').and.returnValue('gfghfjhg');
      onEmailValueSpy = spyOn(component, 'onEmailValue').and.callFake(() => {});
      component.screen = 'wait';
    });
    it('should set fg', () => {
      component.showForm();
      expect(component.emailFc).toEqual(jasmine.any(FormControl));
      expect(component.fg).toEqual(jasmine.any(FormGroup));
      expect(component.fg.get('email')).toEqual(component.emailFc);
      expect(component.emailFc.value).toBe(component.emailFromRoute);
    });

    it('should unsubscribe from an existing subscription', () => {
      const sub = {unsubscribe: jasmine.createSpy()};
      spyOnProperty(component, 'emailSubscription').and.returnValue(sub);
      component.showForm();
      expect(sub.unsubscribe).toHaveBeenCalled();
    });
    it('should set emailSubscription', () => {
      component.showForm();
      expect(component.emailSubscription).toEqual(jasmine.any(Subscription));
    });
    it('should set screen to form', () => {
      component.showForm();
      expect(component.screen).toBe('form');
    });


    it('should call onEmailValue once to begin with', () => {
      component.showForm();
      expect(component.onEmailValue).toHaveBeenCalledWith();
    });
    it('should call onEmailValue when the value changes', fakeAsync(() => {
      component.showForm();
      expect(component.onEmailValue).toHaveBeenCalledTimes(1);
      component.emailFc.setValue('foo@bar.com');
      tick(SignInComponent.emailFetchDebounce);
      expect(component.onEmailValue).toHaveBeenCalledTimes(2);
    }));
    it('should call onEmailValue when the status changes', fakeAsync(() => {
      component.showForm();
      expect(component.onEmailValue).toHaveBeenCalledTimes(1);
      component.emailFc.setValue('foo@bar.com');
      tick(SignInComponent.emailFetchDebounce);
      expect(component.onEmailValue).toHaveBeenCalledTimes(2);
      component.emailFc.setErrors({foo: true});
      tick(SignInComponent.emailFetchDebounce);
      expect(component.onEmailValue).toHaveBeenCalledTimes(3);
    }));
  });

  describe('onEmailValue()', () => {
    let emailFc;
    let fetchSpy;
    beforeEach(() => {
      spyOn(component, 'setChildFormBusy').and.callFake(() => {});
      emailFc = component.emailFc = new FormControl('foo@bar.com');
      fetchSpy = jasmine.createSpy().and.returnValue(Promise.resolve([]));
      spyOnProperty(component, 'authService').and.returnValue({fetchSignInMethodsForEmail: fetchSpy});
    });
    it('should call setChildFormBusy', () => {
      component.onEmailValue();
      expect(component.setChildFormBusy).toHaveBeenCalledWith(false);
    });
    it('should handle success if the api call returns an empty array', fakeAsync(() => {
      fetchSpy.and.returnValue(Promise.resolve([]));
      component.onEmailValue();
      expect(component.methodsFetchStatus).toBe('fetching');
      tick();
      expect(component.methodsFetchStatus).toBe('fetched');
      expect(component.methods).toEqual([]);
    }));
    it('should handle success if the api call returns an array', fakeAsync(() => {
      fetchSpy.and.returnValue(Promise.resolve(['twitter.com', 'password']));
      component.onEmailValue();
      expect(component.methodsFetchStatus).toBe('fetching');
      tick();
      expect(component.methodsFetchStatus).toBe('fetched');
      expect(component.methods).toEqual(['twitter.com', 'password']);
    }));
    it('should handle when the email control is invalid', fakeAsync(() => {
      emailFc.setErrors({foo: true});
      component.onEmailValue();
      expect(component.methodsFetchStatus).toBe('unfetched');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(component.methods).toEqual([]);
    }));
    it('should handle auth/invalid-email error', fakeAsync(() => {
      const err = {code: 'auth/invalid-email'};
      fetchSpy.and.callFake(() => Promise.reject(err));
      component.onEmailValue();
      expect(component.methodsFetchStatus).toBe('fetching');
      expect(fetchSpy).toHaveBeenCalledWith(emailFc.value);
      tick();
      expect(component.methodsFetchStatus).toBe('unfetched');
      expect(emailFc.hasError('auth/invalid-email')).toBe(true);
      emailFc.setValue('hsghgsh');
      expect(emailFc.hasError('auth/invalid-email')).toBe(false);
      expect(component.methods).toEqual([]);
    }));
    it('should handle an unexpected api error', fakeAsync(() => {
      const err = {code: 'auth/foo'};
      component.unhandledError = {code: 'any'} as any;
      fetchSpy.and.callFake(() => Promise.reject(err));
      component.onEmailValue();
      expect(component.unhandledError).toBe(null);
      expect(component.methodsFetchStatus).toBe('fetching');
      expect(fetchSpy).toHaveBeenCalledWith(emailFc.value);
      tick();
      expect(component.methodsFetchStatus).toBe('unfetched');
      expect(emailFc.hasError('auth/invalid-email')).toBe(false);
      expect(component.unhandledError).toBe(err);
      expect(component.methods).toEqual([]);
    }));
  });

  describe('signInWithOAuth', () => {
    let apiSpy;
    beforeEach(() => {
      spyOn(component, 'showSuccess').and.callFake(() => {});
      spyOn(component, 'showError').and.callFake(() => {});
      apiSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({signInWithOAuth: apiSpy});
    });
    it('should show success if signInWithOAuth resolves with cred', fakeAsync(() => {
      const cred = {};
      apiSpy.and.callFake(() => Promise.resolve(cred));
      component.signInWithOAuth('twitter.com');
      expect(apiSpy).toHaveBeenCalledWith('twitter.com');
      tick();
      expect(component.showSuccess).toHaveBeenCalledWith(cred);
    }));
    it('should show error if signInWithOAuth rejects', fakeAsync(() => {
      const error = {};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.signInWithOAuth('twitter.com');
      expect(apiSpy).toHaveBeenCalledWith('twitter.com');
      tick();
      expect(component.showError).toHaveBeenCalledWith(error);
    }));
    it('should show nothing if signInWithOAuth resolves with null ', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve(null));
      component.signInWithOAuth('twitter.com');
      expect(apiSpy).toHaveBeenCalledWith('twitter.com');
      tick();
      expect(component.showSuccess).not.toHaveBeenCalled();
    }));
  });

  describe('ngOnInit()', () => {
    let apiSpy;
    let setRouteSpy;
    beforeEach(() => {
      spyOn(component, 'showForm').and.callFake(() => {});
      spyOn(component, 'showSuccess').and.callFake(() => {});
      spyOn(component, 'showError').and.callFake(() => {});
      apiSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(null));
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({getRedirectResult: apiSpy, setRoute: setRouteSpy});
    });
    it('should set the route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.signIn);
    });
    it('should set formId', () => {
      component.ngOnInit();
      expect(component.formId).toEqual(jasmine.any(String));
    });
    it('should set emailFromRoute if the queryParam exists', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({email: 'foo@bar.com'});
      component.ngOnInit();
      expect(component.emailFromRoute).toBe('foo@bar.com');
    });
    it('should set emailFromRoute if the queryParam does not exist', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({});
      component.ngOnInit();
      expect(component.emailFromRoute).toBe('');
    });
    it('should show error if getRedirectResult rejects', fakeAsync(() => {
      const error = {code: 'foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      expect(apiSpy).toHaveBeenCalledWith();
      tick();
      expect(component.showError).toHaveBeenCalledWith(error);
    }));
    it('should show success if getRedirectResult resolves with a cred', fakeAsync(() => {
      const cred = {};
      apiSpy.and.callFake(() => Promise.resolve(cred));
      component.ngOnInit();
      expect(apiSpy).toHaveBeenCalledWith();
      tick();
      expect(component.showSuccess).toHaveBeenCalledWith(cred);
    }));
    it('should show form if getRedirectResult resolves with null', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve(null));
      component.ngOnInit();
      expect(apiSpy).toHaveBeenCalledWith();
      tick();
      expect(component.showForm).toHaveBeenCalledWith();
    }));
  });
});
