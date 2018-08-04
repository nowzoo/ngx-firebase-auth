import { TestBed, inject } from '@angular/core/testing';

import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';

import {
  NgxFirebaseAuthRoute
} from './shared';

describe('NgxFirebaseAuthService', () => {
  let service: NgxFirebaseAuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgxFirebaseAuthService]
    });
    service = TestBed.get(NgxFirebaseAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should have a route obs', () => {
    expect(service.route.subscribe).toBeTruthy();
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
});
