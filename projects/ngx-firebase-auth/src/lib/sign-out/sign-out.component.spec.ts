import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgxFirebaseAuthRoute, ngxFirebaseAuthRouteSlugs
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
        {provide: ActivatedRoute, useValue: {}},
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
    it('should have route', () => {
      expect(component.route).toBeTruthy();
    });
    it('should have router', () => {
      expect(component.router).toBeTruthy();
    });
  });

  describe('ngOnInit()', () => {
    let setRouteSpy;
    let signOutSpy;
    let navigateSpy;
    beforeEach(() => {
      setRouteSpy = jasmine.createSpy();
      signOutSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      navigateSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({setRoute: setRouteSpy});
      spyOnProperty(component, 'auth').and.returnValue({signOut: signOutSpy});
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
    });
    it('should sign out then navigate to sign in', fakeAsync(() => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.signOut);
      expect(signOutSpy).toHaveBeenCalledWith();
      tick();
      expect(navigateSpy).toHaveBeenCalledWith(['../', ngxFirebaseAuthRouteSlugs.signIn]);
    }));
  });
});
