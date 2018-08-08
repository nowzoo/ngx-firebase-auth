import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { Router } from '@angular/router';
import {
  NgxFirebaseAuthRoute
} from '../shared';

import { SignOutComponent } from './sign-out.component';

describe('SignOutComponent', () => {
  let component: SignOutComponent;
  let fixture: ComponentFixture<SignOutComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignOutComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(SignOutComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(SignOutComponent);
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

    it('should have router', () => {
      expect(component.router).toBeTruthy();
    });
  });

  describe('ngOnInit()', () => {
    let setRouteSpy;
    let signOutSpy;
    let getSignInRouterLinkSpy;
    let navigateSpy;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      signOutSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      navigateSpy = jasmine.createSpy();
      getSignInRouterLinkSpy = jasmine.createSpy().and.callFake(() => ['/', 'auth', 'sign-in']);
      spyOnProperty(component, 'authService').and.returnValue({
        setRoute: setRouteSpy,
        getSignInRouterLink: getSignInRouterLinkSpy
      });
      spyOnProperty(component, 'auth').and.returnValue({signOut: signOutSpy});
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
    });
    it('should sign out then navigate to sign in', fakeAsync(() => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.signOut);
      expect(signOutSpy).toHaveBeenCalledWith();
      tick();
    }));
    it('should navigate', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(getSignInRouterLinkSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(getSignInRouterLinkSpy.calls.mostRecent().returnValue);
    }));
  });
});
