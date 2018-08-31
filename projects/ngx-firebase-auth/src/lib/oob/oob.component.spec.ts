import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OobComponent } from './oob.component';
import { ActivatedRoute } from '@angular/router';
describe('OobComponent', () => {
  let component: OobComponent;
  let fixture: ComponentFixture<OobComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobComponent ],
      providers: [
        {provide: ActivatedRoute, useValue: {snapshot: {queryParams: {}}}},
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
  });

  describe('ngOnInit', () => {
    let modeSpy, navSpy;
    beforeEach(() => {
      modeSpy = spyOn(component.mode, 'emit').and.callThrough();
      navSpy = spyOn(component.navigationError, 'emit').and.callThrough();
    });
    it('should set screen to resetPassword if that is the mode in queryParams', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jsks', mode: 'resetPassword'});
      component.ngOnInit();
      expect(component.screen).toBe('resetPassword');
      expect(modeSpy).toHaveBeenCalledWith('resetPassword');
      expect(navSpy).not.toHaveBeenCalled();
    });
    it('should set screen to verifyEmail if that is the mode in queryParams', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jsks', mode: 'verifyEmail'});
      component.ngOnInit();
      expect(component.screen).toBe('verifyEmail');
      expect(modeSpy).toHaveBeenCalledWith('verifyEmail');
      expect(navSpy).not.toHaveBeenCalled();
    });
    it('should set screen to recoverEmail if that is the mode in queryParams', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jsks', mode: 'recoverEmail'});
      component.ngOnInit();
      expect(component.screen).toBe('recoverEmail');
      expect(modeSpy).toHaveBeenCalledWith('recoverEmail');
      expect(navSpy).not.toHaveBeenCalled();
    });
    it('should not set screen for an unknown mode', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({oobCode: 'jsks', mode: 'foo'});
      component.ngOnInit();
      expect(component.screen).toBe(null);
      expect(modeSpy).not.toHaveBeenCalledWith('foo');
      expect(navSpy).toHaveBeenCalled();
    });
    it('should not set screen if oobCode is missing', () => {
      spyOnProperty(component, 'queryParams').and.returnValue({ mode: 'recoverEmail'});
      component.ngOnInit();
      expect(component.screen).toBe(null);
      expect(modeSpy).not.toHaveBeenCalledWith('recoverEmail');
      expect(navSpy).toHaveBeenCalled();
    });
  });
});
