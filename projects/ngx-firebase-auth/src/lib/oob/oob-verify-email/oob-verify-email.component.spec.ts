import {  ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';
import {
  INgxFirebaseAuthOobResult, NgxFirebaseAuthRoute
} from '../../shared';

import { OobVerifyEmailComponent } from './oob-verify-email.component';

describe('OobVerifyEmailComponent', () => {
  let component: OobVerifyEmailComponent;
  let fixture: ComponentFixture<OobVerifyEmailComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobVerifyEmailComponent ],
      providers: [
        {provide: NgxFirebaseAuthService, useValue: {}},
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
    it('should have authService', () => {
      expect(component.authService).toBeTruthy();
    });
  });

  describe('ngOnInit()', () => {
    let setRouteSpy;
    let submitSpy;
    beforeEach(() => {
      submitSpy = spyOn(component, 'submit');
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
    });
    it('should set the route', () => {
      const result: any = {error: null};
      component.result = result;
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.verifyEmailCode);
    });
    it('should show error if result has an error', () => {
      const error: any = {code: 'foo'};
      const result: any = {error: error};
      component.result = result;
      component.ngOnInit();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    });
    it('should submit', () => {
      const result: any = {error: null};
      component.result = result;
      component.ngOnInit();
      expect(component.screen).toBe('wait');
      expect(submitSpy).toHaveBeenCalled();
    });
  });

  describe('submit()', () => {
    let result: any;
    let apiSpy;
    beforeEach(() => {
      result = {code: 'oob'};
      component.result = result;
      apiSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({applyActionCode: apiSpy});
    });
    it('should set submitting to true', () => {
      apiSpy.and.callFake(() => Promise.resolve());
      expect(component.submitting).toBe(false);
      component.submit();
      expect(component.submitting).toBe(true);
    });
    it('should show success if applyActionCode succeeds', fakeAsync(() => {
      apiSpy.and.callFake(() => Promise.resolve());
      component.submit();
      expect(apiSpy).toHaveBeenCalledWith(result.code);
      tick();
      expect(component.screen).toBe('success');
    }));
    it('should show error if the applyActionCode call fails', fakeAsync(() => {
      const error = {code: 'foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      expect(apiSpy).toHaveBeenCalledWith(result.code);
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));
  });
});
