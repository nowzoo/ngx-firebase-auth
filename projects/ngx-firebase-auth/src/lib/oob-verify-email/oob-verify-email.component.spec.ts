import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl } from '@angular/forms';

import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import { NgxFirebaseAuthRoute } from '../shared';

import { OobVerifyEmailComponent } from './oob-verify-email.component';

describe('OobVerifyEmailComponent', () => {
  let component: OobVerifyEmailComponent;
  let fixture: ComponentFixture<OobVerifyEmailComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobVerifyEmailComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
      ]
    })
    .overrideTemplate(OobVerifyEmailComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(OobVerifyEmailComponent);
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



  describe('ngOnInit()', () => {
    let oobCode;
    let setRouteSpy;
    let actionCodeInfo;
    let checkActionCodeSpy;
    let submitSpy;
    beforeEach(() => {
      submitSpy = spyOn(component, 'submit').and.callFake(() => {});
      oobCode = 'oob-code';
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: oobCode});
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({
        setRoute: setRouteSpy
      });
      actionCodeInfo = {data: {email: 'foo@bar.com'}};
      checkActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(actionCodeInfo));
      spyOnProperty(component, 'auth').and.returnValue({
        checkActionCode: checkActionCodeSpy
      });
    });
    it('should set route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.oobVerifyEmail);
    });
    it('should call auth.checkActionCode', () => {
      component.ngOnInit();
      expect(checkActionCodeSpy).toHaveBeenCalledWith(oobCode);
    });
    it('should submit if checkActionCode succeeds', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('wait');
      expect(submitSpy).toHaveBeenCalledWith();
    }));
    it('should set screen to error if checkActionCodeSpy fails', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      checkActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));
  });

  describe('submit()', () => {
    let oobCode;
    let actionCodeInfo;
    let applyActionCodeSpy;
    let pushActionCodeSuccessSpy;

    let actionCodeSuccess;

    beforeEach(() => {
      actionCodeInfo = {data: {email: 'foo@bar.com'}};
      oobCode = 'oob-code';
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: oobCode});
      applyActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        applyActionCode: applyActionCodeSpy,
      });
      actionCodeSuccess = {user: null, actionCodeInfo: actionCodeInfo};
      pushActionCodeSuccessSpy = jasmine.createSpy().and.callFake(() =>
        Promise.resolve(actionCodeSuccess)
      );
      spyOnProperty(component, 'authService').and.returnValue({
        pushActionCodeSuccess: pushActionCodeSuccessSpy,
      });
      component.screen = 'wait';
      component.actionCodeInfo = actionCodeInfo as any;
    });

    it('should handle success', fakeAsync(() => {
      component.screen = 'wait';
      component.unhandledError = {} as any;
      component.actionCodeSuccess = {} as any;
      component.submit();
      expect(applyActionCodeSpy).toHaveBeenCalledWith(oobCode);
      expect(component.unhandledError).toBe(null);
      expect(component.actionCodeSuccess).toBe(null);
      expect(component.screen).toBe('wait');
      tick();
      expect(pushActionCodeSuccessSpy).toHaveBeenCalledWith(component.actionCodeInfo);
      expect(component.actionCodeSuccess).toBe(actionCodeSuccess);
      expect(component.screen).toBe('success');
      expect(component.unhandledError).toBe(null);
    }));

    it('should handle failure', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      applyActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.screen = 'wait';
      component.unhandledError = {} as any;
      component.actionCodeSuccess = {} as any;
      component.submit();
      expect(applyActionCodeSpy).toHaveBeenCalledWith(oobCode);
      expect(component.unhandledError).toBe(null);
      expect(component.actionCodeSuccess).toBe(null);
      expect(component.screen).toBe('wait');
      tick();
      expect(pushActionCodeSuccessSpy).not.toHaveBeenCalled();
      expect(component.actionCodeSuccess).toBe(null);
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);

    }));
  });
});
