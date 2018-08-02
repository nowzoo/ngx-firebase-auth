import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFirebaseAuthRoute } from '../shared';
import { Subject } from 'rxjs';

import { VerifyEmailComponent } from './verify-email.component';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyEmailComponent ],
      providers: [
        {provide: NgxFirebaseAuthService, useValue: {}},
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(VerifyEmailComponent);
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
    let redirectSpy;
    let authState$;
    let apiSpy;
    let user;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      redirectSpy = jasmine.createSpy();
      authState$ = new Subject();
      user = {};
      apiSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'authService').and.returnValue({
        internalRedirect: redirectSpy,
        authState: authState$.asObservable(),
        setRoute: setRouteSpy,
        sendEmailVerification: apiSpy
      });
    });
    it('should set route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.verifyEmailSend);
    });
    it('should not do anything unti the authState changes', () => {
      component.ngOnInit();
      expect(redirectSpy).not.toHaveBeenCalled();
      expect(apiSpy).not.toHaveBeenCalled();
      expect(component.screen).toBe('wait');
    });
    it('should redirect if the user is not signed in', () => {
      component.ngOnInit();
      authState$.next(null);
      expect(redirectSpy).toHaveBeenCalledWith('sign-in');
    });
    it('should make the api call', () => {
      component.ngOnInit();
      authState$.next(user);
      expect(apiSpy).toHaveBeenCalledWith(user);
      expect(component.screen).toBe('wait');
    });
    it('should show success', fakeAsync(() => {
      component.ngOnInit();
      authState$.next(user);
      tick();
      expect(component.screen).toBe('success');
    }));
    it('should handle failure', fakeAsync(() => {
      const error = {code: 'foo'};
      apiSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      authState$.next(user);
      tick();
      expect(component.screen).toBe('error');
      expect(component.error).toBe(error);
    }));

  });


});
