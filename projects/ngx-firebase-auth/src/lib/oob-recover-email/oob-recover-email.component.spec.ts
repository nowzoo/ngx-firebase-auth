import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  NGX_FIREBASE_AUTH_OPTIONS
} from '../shared';

import { OobRecoverEmailComponent } from './oob-recover-email.component';

describe('OobRecoverEmailComponent', () => {
  let component: OobRecoverEmailComponent;
  let fixture: ComponentFixture<OobRecoverEmailComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobRecoverEmailComponent ],
      providers: [
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}, authState: new Subject()}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(OobRecoverEmailComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(OobRecoverEmailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have auth', () => {
    expect(component.auth).toBeTruthy();
  });
  it('should have authState', () => {
    expect(component.authState).toBeTruthy();
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



  describe('ngOnInit()', () => {
    let oobCode;
    let navigateSpy;
    let setRouteSpy;
    let checkActionCodeSpy;
    let actionCodeInfo;
    beforeEach(() => {
      oobCode = 'oob-code';
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: oobCode});
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
      navigateSpy = jasmine.createSpy();
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
      actionCodeInfo = {data: {email: 'foo@bar.com', fromEmail: 'oof@bar.com'}};
      checkActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(actionCodeInfo));

      spyOnProperty(component, 'auth').and.returnValue({
        checkActionCode: checkActionCodeSpy
      });
    });
    it('should set route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.oobRecoverEmail);
    });
    it('should call auth.checkActionCode', () => {
      component.ngOnInit();
      expect(checkActionCodeSpy).toHaveBeenCalledWith(oobCode);
    });
    it('should set screen to form if checkActionCode succeeds', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('form');
    }));
    it('should set screen to error if checkActionCode fails', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      checkActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));
  });

  describe('submit()', () => {
    let oobCode;
    let actionCodeInfo;
    let applyActionCodeSpy;
    let pushActionCodeSuccessSpy;
    let navigateSpy;
    let getSignInRouterLinkSpy, getIndexRouterLinkSpy;

    beforeEach(() => {
      actionCodeInfo = {data: {email: 'foo@bar.com'}};
      oobCode = 'oob-code';
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: oobCode});
      applyActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        applyActionCode: applyActionCodeSpy,
      });
      pushActionCodeSuccessSpy = jasmine.createSpy().and.callFake(() =>
        Promise.resolve({user: null, actionCodeInfo: actionCodeInfo})
      );
      getSignInRouterLinkSpy = jasmine.createSpy().and.returnValue(['/', 'auth', 'sign-in']);
      getIndexRouterLinkSpy = jasmine.createSpy().and.returnValue(['/', 'auth']);
      spyOnProperty(component, 'authService').and.returnValue({
        pushActionCodeSuccess: pushActionCodeSuccessSpy,
        successMessage: null,
        redirectCancelled: false,
        getIndexRouterLink: getIndexRouterLinkSpy,
        getSignInRouterLink: getSignInRouterLinkSpy
      });
      navigateSpy = jasmine.createSpy();
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
      component.screen = 'wait';
      component.actionCodeInfo = actionCodeInfo as any;
    });

    it('should set error to null', () => {
      component.error = {} as any;
      component.submit();
      expect(component.error).toBe(null);
    });
    it('should call applyActionCode', fakeAsync(() => {
      component.submit();
      expect(applyActionCodeSpy).toHaveBeenCalledWith(oobCode);
      tick();
      expect(component.screen).toBe(null);
    }));
    it('should handle applyActionCode error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      applyActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.screen).toBe('error');
    }));


    it('should call pushActionCodeSuccess with the info', fakeAsync(() => {
      component.submit();
      tick();
      expect(pushActionCodeSuccessSpy).toHaveBeenCalledWith(component.actionCodeInfo);
    }));
    it('should set success message if redirectCancelled is false', fakeAsync(() => {
      component.authService.redirectCancelled = false;
      component.authService.successMessage = null;
      component.submit();
      tick();
      expect(component.authService.successMessage).toBeTruthy();
    }));

    it('should redirect to sign in if the user is not signed in', fakeAsync(() => {
      pushActionCodeSuccessSpy.and.callFake(() =>
        Promise.resolve({user: null, actionCodeInfo: actionCodeInfo})
      );
      component.authService.redirectCancelled = false;
      component.submit();
      tick();
      expect(navigateSpy).toHaveBeenCalledWith(
        getSignInRouterLinkSpy.calls.mostRecent().returnValue,
        {queryParams: {email: 'foo@bar.com'}}
      );
      expect(getSignInRouterLinkSpy).toHaveBeenCalled();

    }));
    it('should redirect to index if the user is signed in', fakeAsync(() => {
      pushActionCodeSuccessSpy.and.callFake(() =>
        Promise.resolve({user: {}, actionCodeInfo: actionCodeInfo})
      );
      component.authService.redirectCancelled = false;
      component.submit();
      tick();
      expect(navigateSpy).toHaveBeenCalledWith(
        getIndexRouterLinkSpy.calls.mostRecent().returnValue
      );
      expect(getIndexRouterLinkSpy).toHaveBeenCalled();
    }));

    it('should handle auth/foo error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      applyActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));
  });
});
