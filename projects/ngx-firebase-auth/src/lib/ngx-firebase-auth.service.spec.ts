import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';

import { NgxFirebaseAuthService } from './ngx-firebase-auth.service';

describe('NgxFirebaseAuthService', () => {
  let service: NgxFirebaseAuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NgxFirebaseAuthService,
        {provide: AngularFireAuth, useValue: {auth: {}}}
      ]
    });
    service = TestBed.get(NgxFirebaseAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getters', () => {
    it('should have auth', () => {
      expect(service.auth).toBeTruthy();
    });
    it('should have storage', () => {
      expect(service.storage).toBeTruthy();
    });
  });
  describe('getRemembered()', () => {
    let getItemSpy;
    beforeEach(() => {
      getItemSpy = jasmine.createSpy().and.callFake(() => null);
      spyOnProperty(service, 'storage').and.returnValue({getItem: getItemSpy});
    });
    it('should call getItem', () => {
      service.getRemembered();
      expect(getItemSpy).toHaveBeenCalledWith(NgxFirebaseAuthService.rememberKey);
    });
    it('should return the right thing if the item has not been set', () => {
      const remembered = service.getRemembered();
      expect(remembered.email).toBe('');
      expect(remembered.remember).toBe(true);
    });
    it('should return the right thing if the item is bad JSON', () => {
      getItemSpy.and.callFake(() => 'foo');
      const remembered = service.getRemembered();
      expect(remembered.email).toBe('');
      expect(remembered.remember).toBe(true);
    });
    it('should return the right thing if the item is good JSON', () => {
      getItemSpy.and.callFake(() => JSON.stringify({remember: true, email: 'foo@bar.com'}));
      const remembered = service.getRemembered();
      expect(remembered.email).toBe('foo@bar.com');
      expect(remembered.remember).toBe(true);
    });
  });

  describe('setRemembered(remember: boolean, email: string)', () => {
    let setItemSpy;
    let setPersistenceSpy;
    let stringifySpy;
    beforeEach(() => {
      setItemSpy = jasmine.createSpy();
      spyOnProperty(service, 'storage').and.returnValue({setItem: setItemSpy});
      setPersistenceSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(service, 'auth').and.returnValue({setPersistence: setPersistenceSpy});
      stringifySpy = spyOn(JSON, 'stringify').and.callThrough();
    });
    it('should set the persistence if remember is true', () => {
      service.setRemembered(true, 'foo@bar.com');
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.LOCAL);
    });
    it('should set the persistence if remember is false', () => {
      service.setRemembered(false, 'foo@bar.com');
      expect(setPersistenceSpy).toHaveBeenCalledWith(auth.Auth.Persistence.SESSION);
    });
    it('should call json stringify', fakeAsync(() => {
      service.setRemembered(true, 'foo@bar.com');
      tick();
      expect(stringifySpy).toHaveBeenCalledWith(jasmine.objectContaining({remember: true, email: 'foo@bar.com'}));

    }));
    it('should call setItem', fakeAsync(() => {
      service.setRemembered(true, 'foo@bar.com');
      tick();
      expect(setItemSpy).toHaveBeenCalledWith(NgxFirebaseAuthService.rememberKey, stringifySpy.calls.mostRecent().returnValue);

    }));
  });
});
