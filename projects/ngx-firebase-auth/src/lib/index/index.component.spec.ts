import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { auth } from 'firebase/app';
import { BehaviorSubject } from 'rxjs';

import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute, NGX_FIREBASE_AUTH_OPTIONS
} from '../shared';
import { IndexComponent } from './index.component';

describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexComponent ],
      providers: [
        {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: {}},
        {provide: AngularFireAuth, useValue: {auth: {}, authState: new BehaviorSubject({})}},
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
      ]
    })
    .overrideTemplate(IndexComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have options', () => {
    expect(component.options).toBeTruthy();
  });

  it('should have auth', () => {
    expect(component.auth).toBeTruthy();
  });
  it('should have authService', () => {
    expect(component.authService).toBeTruthy();
  });
  it('should have authState', () => {
    expect(component.authState).toBeTruthy();
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
    let setRouteSpy;
    let authState$;
    let navigateSpy;
    let getSignInRouterLinkSpy;
    beforeEach(() => {
      getSignInRouterLinkSpy = jasmine.createSpy().and.returnValue(['/', 'auth', 'sign-in']);
      authState$ = new BehaviorSubject(null);
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({
        setRoute: setRouteSpy,
        getSignInRouterLink: getSignInRouterLinkSpy,
        successMessage: null
      });
      spyOnProperty(component, 'authState').and.returnValue(authState$.asObservable());
      navigateSpy = jasmine.createSpy();
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
    });
    it('should set the route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.index);
    });
    it('should set successMessage to null if authService.successMessage is null', () => {
      component.authService.successMessage = null;
      component.ngOnInit();
      expect(component.successMessage).toBe(null);
    });
    it('should set successMessage to authService.successMessage, then clear authService.successMessage', () => {
      component.authService.successMessage = 'foo bar';
      component.ngOnInit();
      expect(component.successMessage).toBe('foo bar');
      expect(component.authService.successMessage).toBe(null);
    });
    it('should subscribe and unsubscribe from authState', () => {
      component.ngOnInit();
      expect(authState$.observers.length).toBe(1);
      component.ngOnDestroy();
      expect(authState$.observers.length).toBe(0);
    });
    it('should navigate if the user is not signed in', () => {
      authState$.next({uid: 'a-uid'});
      component.ngOnInit();
      expect(navigateSpy).not.toHaveBeenCalled();
      authState$.next(null);
      expect(getSignInRouterLinkSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(getSignInRouterLinkSpy.calls.mostRecent().returnValue);
    });
    it('should not navigate if the user is signed in', () => {
      authState$.next({uid: 'a-uid'});
      component.ngOnInit();
      expect(navigateSpy).not.toHaveBeenCalled();
      authState$.next({});
      expect(getSignInRouterLinkSpy).not.toHaveBeenCalled();
      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });
});
