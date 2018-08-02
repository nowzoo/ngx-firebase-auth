import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import {
  INgxFirebaseAuthOobResult,
  NgxFirebaseAuthRoute
} from '../shared';

import { OobComponent } from './oob.component';

describe('OobComponent', () => {
  let component: OobComponent;
  let fixture: ComponentFixture<OobComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobComponent ],
      providers: [
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
      ]
    })
    .overrideTemplate(OobComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(OobComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getters', () => {
    it('should have queryParams', () => {
      expect(component.queryParams).toBeTruthy();
    });
    it('should have authService', () => {
      expect(component.authService).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    let apiSpy;
    let setRouteSpy;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      apiSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({handleOob: apiSpy, setRoute: setRouteSpy});
    });
    it('should set the route', () => {
      apiSpy.and.callFake(() => Promise.resolve({mode: 'resetPassword', error: null}));
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.oob);
    });
    it('should set screen to error if error.code is ngx-fire-auth/missing-oob-parameters', fakeAsync(() => {
      const error = {code: 'ngx-fire-auth/missing-oob-parameters'};
      apiSpy.and.callFake(() => Promise.resolve({mode: 'resetPassword', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));
    it('should set screen to resetPassword if no error', fakeAsync(() => {
      const error = null;
      apiSpy.and.callFake(() => Promise.resolve({mode: 'resetPassword', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('resetPassword');
      expect(component.error).toBe(null);
    }));
    it('should set screen to resetPassword if error.code is not ngx-fire-auth/missing-oob-parameters', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      apiSpy.and.callFake(() => Promise.resolve({mode: 'resetPassword', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('resetPassword');
      expect(component.error).toBe(null);
    }));
    it('should set screen to error if error.code is ngx-fire-auth/missing-oob-parameters', fakeAsync(() => {
      const error = {code: 'ngx-fire-auth/missing-oob-parameters'};
      apiSpy.and.callFake(() => Promise.resolve({mode: 'verifyEmail', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));
    it('should set screen to verifyEmail if no error', fakeAsync(() => {
      const error = null;
      apiSpy.and.callFake(() => Promise.resolve({mode: 'verifyEmail', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('verifyEmail');
      expect(component.error).toBe(null);
    }));
    it('should set screen to verifyEmail if error.code is not ngx-fire-auth/missing-oob-parameters', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      apiSpy.and.callFake(() => Promise.resolve({mode: 'verifyEmail', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('verifyEmail');
      expect(component.error).toBe(null);
    }));
    it('should set screen to error if error.code is ngx-fire-auth/missing-oob-parameters', fakeAsync(() => {
      const error = {code: 'ngx-fire-auth/missing-oob-parameters'};
      apiSpy.and.callFake(() => Promise.resolve({mode: 'recoverEmail', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));
    it('should set screen to recoverEmail if no error', fakeAsync(() => {
      const error = null;
      apiSpy.and.callFake(() => Promise.resolve({mode: 'recoverEmail', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('recoverEmail');
      expect(component.error).toBe(null);
    }));
    it('should set screen to recoverEmail if error.code is not ngx-fire-auth/missing-oob-parameters', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      apiSpy.and.callFake(() => Promise.resolve({mode: 'recoverEmail', error: error}));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('recoverEmail');
      expect(component.error).toBe(null);
    }));
  });
});
