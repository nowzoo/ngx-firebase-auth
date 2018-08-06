import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthRoute } from '../shared';

import { OobComponent } from './oob.component';

describe('OobComponent', () => {
  let component: OobComponent;
  let fixture: ComponentFixture<OobComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobComponent ],
      providers: [
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
        {provide: Router, useValue: {}},
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

  it('should have authService', () => {
    expect(component.authService).toBeTruthy();
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
    let navigateSpy;
    let setRouteSpy;
    let indexLinkSpy;
    let rpLinkSpy;
    let reLinkSpy;
    let veLinkSpy;
    beforeEach(() => {
      indexLinkSpy = jasmine.createSpy().and.returnValue(['/', 'auth']);
      rpLinkSpy = jasmine.createSpy().and.returnValue(['/', 'auth', 'oob', 'reset-password']);
      reLinkSpy = jasmine.createSpy().and.returnValue(['/', 'auth', 'oob', 'recover-email']);
      veLinkSpy = jasmine.createSpy().and.returnValue(['/', 'auth', 'oob', 'verify-email']);
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({
        setRoute: setRouteSpy,
        getIndexRouterLink: indexLinkSpy,
        getOobResetPasswordRouterLink: rpLinkSpy,
        getOobVerifyEmailRouterLink: veLinkSpy,
        getOobRecoverEmailRouterLink: reLinkSpy
      });
      navigateSpy = jasmine.createSpy();
      spyOnProperty(component, 'router').and.returnValue({navigate: navigateSpy});
    });
    it('should set the route', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.oob);
    });
    it('should navigate to index if oobCode is not present in queryParams', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({mode: 'resetPassword'});
      component.ngOnInit();
      expect(indexLinkSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(indexLinkSpy.calls.mostRecent().returnValue);
    });
    it('should navigate to index if mode is not present in queryParams', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jshhsk'});
      component.ngOnInit();
      expect(indexLinkSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(indexLinkSpy.calls.mostRecent().returnValue);
    });
    it('should navigate to index if mode is not recognized', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jshhsk', mode: 'foo'});
      component.ngOnInit();
      expect(indexLinkSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(indexLinkSpy.calls.mostRecent().returnValue);
    });
    it('should navigate to reset-password if mode is resetPassword', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jshhsk', mode: 'resetPassword'});
      component.ngOnInit();
      expect(rpLinkSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(
        rpLinkSpy.calls.mostRecent().returnValue, {queryParamsHandling: 'merge'}
      );
    });
    it('should navigate to verify-email if mode is verifyEmail', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jshhsk', mode: 'verifyEmail'});
      component.ngOnInit();
      expect(veLinkSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(
        veLinkSpy.calls.mostRecent().returnValue, {queryParamsHandling: 'merge'}
      );
    });
    it('should navigate to recover-email if mode is recoverEmail', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jshhsk', mode: 'recoverEmail'});
      component.ngOnInit();
      expect(reLinkSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(
        reLinkSpy.calls.mostRecent().returnValue, {queryParamsHandling: 'merge'}
      );
    });
  });
});
