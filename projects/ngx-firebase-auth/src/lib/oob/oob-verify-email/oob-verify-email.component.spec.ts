import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { OobVerifyEmailComponent } from './oob-verify-email.component';
import { AngularFireAuth } from 'angularfire2/auth';

describe('OobVerifyEmailComponent', () => {
  let component: OobVerifyEmailComponent;
  let fixture: ComponentFixture<OobVerifyEmailComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobVerifyEmailComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
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

  describe('getters', () => {
    it('should have auth', () => {
      expect(component.auth).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    let actionCodeInfo;
    let checkActionCodeSpy;
    let applyActionCodeSpy;
    let successSpy;
    let oobCode;
    beforeEach(() => {
      component.oobCode = oobCode = 'foo-bar';
      actionCodeInfo = {};
      checkActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(actionCodeInfo));
      applyActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        checkActionCode: checkActionCodeSpy,
        applyActionCode: applyActionCodeSpy,
        currentUser: null
      });
      successSpy = spyOn(component.success, 'emit').and.callThrough();

    });
    it('should deal with success', fakeAsync(() => {
      component.ngOnInit();
      expect(checkActionCodeSpy).toHaveBeenCalledWith(oobCode);
      tick();
      expect(component.info).toBe(actionCodeInfo);
      expect(applyActionCodeSpy).toHaveBeenCalledWith(oobCode);
      expect(successSpy).toHaveBeenCalledWith({
        mode: 'verifyEmail',
        info: actionCodeInfo,
        user: null
      });
      expect(component.screen).toBe('success');

    }));
    it('should handle checkActionCode error', fakeAsync(() => {
      const error = new Error('foo');
      checkActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      tick();
      expect(applyActionCodeSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));
    it('should handle applyActionCode error', fakeAsync(() => {
      const error = new Error('foo');
      applyActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      tick();
      expect(applyActionCodeSpy).toHaveBeenCalled();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));
  });
});
