import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subject } from 'rxjs';
import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';

import {
  NgxFirebaseAuthRoute
} from './shared';

describe('NgxFirebaseAuthService', () => {
  let service: NgxFirebaseAuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NgxFirebaseAuthService,
        {provide: AngularFireAuth, useValue: {auth: {}, authState: new Subject()}},
      ]
    });
    service = TestBed.get(NgxFirebaseAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should have a route obs', () => {
    expect(service.route.subscribe).toBeTruthy();
  });

  it('should have authState', () => {
    expect(service.authState).toBeTruthy();
  });

  describe('setRoute', () => {
    let value;
    beforeEach(() => {
      service.route.subscribe(v => value = v);
    });
    it('should push the route', () => {
      service.setRoute(NgxFirebaseAuthRoute.signIn);
      expect(value).toBe(NgxFirebaseAuthRoute.signIn);
    });
  });

  describe('pushActionCodeSuccess(info)', () => {
    let authState: Subject<any>;
    let user;
    let info: any;
    beforeEach(() => {
      info = {};
      user = {};
      authState = new Subject();
      spyOnProperty(service, 'authState').and.returnValue(authState.asObservable());
    });
    it('should resolve only after the authState resolves', fakeAsync(() => {
      let resolved;
      service.pushActionCodeSuccess(info).then(r => resolved = r);
      tick();
      expect(resolved).toBeUndefined();
      authState.next(null);
      tick();
      expect(resolved).toEqual({user: null, actionCodeInfo: info});
    }));
    it('should resolve only after the authState resolves if user signed in', fakeAsync(() => {
      let resolved;
      service.pushActionCodeSuccess(info).then(r => resolved = r);
      tick();
      expect(resolved).toBeUndefined();
      authState.next(user);
      tick();
      expect(resolved).toEqual({user: user, actionCodeInfo: info});
    }));
  });

  describe('setBaseRoute(route: ActivatedRoute)', () => {
    it('should work if there is no parent', () => {
      const snapshot = {url: [{path: 'auth'}], parent: null};
      const route: any = {snapshot: snapshot};
      service.setBaseRoute(route);
      expect(service.baseRouteSlugs).toEqual(['/', 'auth'] );
    });
    it('should work if there is a parent', () => {
      const snapshot = {url: [{path: 'auth'}], parent: {
        url: [{path: 'foo'}]
      }};
      const route: any = {snapshot: snapshot};
      service.setBaseRoute(route);
      expect(service.baseRouteSlugs).toEqual(['/', 'foo', 'auth'] );
    });
    it('should work if url is empty', () => {
      const snapshot = {url: [], parent: null};
      const route: any = {snapshot: snapshot};
      service.setBaseRoute(route);
      expect(service.baseRouteSlugs).toEqual(['/'] );
    });
  });

  describe('link getters', () => {
    beforeEach(() => {
      const snapshot = {url: [{path: 'auth'}], parent: null};
      const route: any = {snapshot: snapshot};
      service.setBaseRoute(route);
    });
    it('should have getOobResetPasswordRouterLink() and return the right slugs', () => {
      expect(service.getOobResetPasswordRouterLink()).toEqual(['/', 'auth', 'oob', 'reset-password']);
    });
    it('should have getOobRecoverEmailRouterLink() and return the right slugs', () => {
      expect(service.getOobRecoverEmailRouterLink()).toEqual(['/', 'auth', 'oob', 'recover-email']);
    });
    it('should have getOobVerifyEmailRouterLink() and return the right slugs', () => {
      expect(service.getOobVerifyEmailRouterLink()).toEqual(['/', 'auth', 'oob', 'verify-email']);
    });
  });
});
