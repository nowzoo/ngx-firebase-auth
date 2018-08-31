import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { OobRecoverEmailComponent } from './oob-recover-email.component';
import { AngularFireAuth } from 'angularfire2/auth';

describe('OobRecoverEmailComponent', () => {
  let component: OobRecoverEmailComponent;
  let fixture: ComponentFixture<OobRecoverEmailComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobRecoverEmailComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(OobRecoverEmailComponent);
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
    let oobCode;
    beforeEach(() => {
      component.oobCode = oobCode = 'foo-bar';
      actionCodeInfo = {data: {email: 'foo@bar.com'}};
      checkActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(actionCodeInfo));
      spyOnProperty(component, 'auth').and.returnValue({
        checkActionCode: checkActionCodeSpy,
      });
    });
    it('should handle success', fakeAsync(() => {
      component.ngOnInit();
      expect(checkActionCodeSpy).toHaveBeenCalledWith(oobCode);
      tick();
      expect(component.info).toBe(actionCodeInfo);
      expect(component.screen).toBe('form');
    }));
    it('should handle checkActionCode error', fakeAsync(() => {
      const error = new Error('foo');
      checkActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));
  });
  describe('submit()', () => {
    let actionCodeInfo;
    let applyActionCodeSpy;
    let successSpy;
    let oobCode;
    beforeEach(() => {
      component.oobCode = oobCode = 'foo-bar';
      component.info = actionCodeInfo = {data: {email: 'foo@bar.com'}} as any;
      applyActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        applyActionCode: applyActionCodeSpy,
        currentUser: null
      });
      successSpy = spyOn(component.success, 'emit').and.callThrough();

    });
    it('should deal with success', fakeAsync(() => {
      component.submit();
      expect(applyActionCodeSpy).toHaveBeenCalledWith(oobCode);
      tick();
      expect(successSpy).toHaveBeenCalledWith({
        mode: 'recoverEmail',
        info: actionCodeInfo,
        user: null
      });
      expect(component.screen).toBe('success');
    }));
    it('should handle applyActionCode error', fakeAsync(() => {
      const error = new Error('foo');
      applyActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));

  });
});
