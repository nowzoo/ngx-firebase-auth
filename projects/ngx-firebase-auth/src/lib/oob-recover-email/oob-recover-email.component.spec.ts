import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormControl } from '@angular/forms';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, } from '@angular/router';
import { auth } from 'firebase/app';
import { NgxFirebaseAuthRoute } from '../shared';

import { OobRecoverEmailComponent } from './oob-recover-email.component';

describe('OobRecoverEmailComponent', () => {
  let component: OobRecoverEmailComponent;
  let fixture: ComponentFixture<OobRecoverEmailComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobRecoverEmailComponent ],
      providers: [
        { provide: AngularFireAuth, useValue: {auth: {}} },
        { provide: NgxFirebaseAuthService, useValue: {} },
        { provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
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
    let checkActionCodeSpy;
    let actionCodeInfo;
    beforeEach(() => {
      oobCode = 'oob-code';
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: oobCode});
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
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
      expect(component.unhandledError).toBe(error);
    }));
  });

  describe('submit()', () => {
    let oobCode;
    let actionCodeInfo;
    let applyActionCodeSpy;
    let pushActionCodeSuccessSpy;

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
      spyOnProperty(component, 'authService').and.returnValue({
        pushActionCodeSuccess: pushActionCodeSuccessSpy,
      });
      component.screen = 'form';
      component.actionCodeInfo = actionCodeInfo as any;
    });

    it('should handle success', fakeAsync(() => {
      component.screen = 'wait';
      component.unhandledError = {} as any;
      component.submit();
      expect(applyActionCodeSpy).toHaveBeenCalledWith(oobCode);
      expect(component.unhandledError).toBe(null);
      expect(component.screen).toBe('wait');
      tick();
      expect(pushActionCodeSuccessSpy).toHaveBeenCalledWith(component.actionCodeInfo);
      expect(component.screen).toBe('success');
      expect(component.unhandledError).toBe(null);
    }));

    it('should handle failure', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      applyActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.screen = 'wait';
      component.unhandledError = {} as any;
      component.submit();
      expect(applyActionCodeSpy).toHaveBeenCalledWith(oobCode);
      expect(component.unhandledError).toBe(null);
      expect(component.screen).toBe('wait');
      tick();
      expect(pushActionCodeSuccessSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);

    }));


  });
});
