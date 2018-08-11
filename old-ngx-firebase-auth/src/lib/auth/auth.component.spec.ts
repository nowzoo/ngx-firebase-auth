import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { ActivatedRoute } from '@angular/router';
import { NgxFirebaseAuthRoute } from '../shared';

import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthComponent ],
      providers: [
        {provide: NgxFirebaseAuthService, useValue: {}},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}} },
      ]
    })
    .overrideTemplate(AuthComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(AuthComponent);
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

  describe('ngOnInit() and ngOnDestroy()', () => {
    let setBaseRouteSpy;
    let setRouteSpy;
    beforeEach(() => {
      setBaseRouteSpy = jasmine.createSpy();
      setRouteSpy = jasmine.createSpy();
      spyOnProperty(component, 'authService').and.returnValue({
        setBaseRoute: setBaseRouteSpy,
        setRoute: setRouteSpy
      });
    });
    it('should call setBaseRoute() with the route', () => {
      component.ngOnInit();
      expect(setBaseRouteSpy).toHaveBeenCalledWith(component.route);
    });
    it('should call setRoute() with auth', () => {
      component.ngOnInit();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.auth);
    });
    it('should call setRoute() with non OnDestroy', () => {
      component.ngOnDestroy();
      expect(setRouteSpy).toHaveBeenCalledWith(NgxFirebaseAuthRoute.none);
    });
  });

});
