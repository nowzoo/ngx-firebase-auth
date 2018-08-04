import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { auth } from 'firebase/app';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';

import { FormControl, FormGroup } from '@angular/forms';
import { RememberFormComponent } from './remember-form.component';

describe('RememberFormComponent', () => {
  let component: RememberFormComponent;
  let fixture: ComponentFixture<RememberFormComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ RememberFormComponent ],
      providers: [
        {provide: NgxFirebaseAuthService, useValue: {}}
      ]
    })
    .overrideTemplate(RememberFormComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(RememberFormComponent);
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

  describe('ngOnInit', () => {
    let valueSpy;
    let submitSpy;
    beforeEach(() => {
      submitSpy = spyOn(component, 'submit').and.callFake(() => {});
      valueSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(true));
      spyOnProperty(component, 'authService').and.returnValue({getRememberOnDevice: valueSpy});
    });
    it('should set formId', () => {
      component.ngOnInit();
      expect(component.formId).toEqual(jasmine.any(String));
    });
    it('should get the initial value', () => {
      component.ngOnInit();
      expect(valueSpy).toHaveBeenCalled();
    });
    it('should set fc after getting the initial value', fakeAsync(() => {
      component.ngOnInit();
      tick();
      expect(component.fc).toEqual(jasmine.any(FormControl));
    }));
    it('should set the value to true if the service call resolves with true', fakeAsync(() => {
      valueSpy.and.callFake(() => Promise.resolve(true));
      component.ngOnInit();
      tick();
      expect(component.fc.value).toBe(true);
    }));
    it('should set the value to false if the service call resolves with false', fakeAsync(() => {
      valueSpy.and.callFake(() => Promise.resolve(false));
      component.ngOnInit();
      tick();
      expect(component.fc.value).toBe(false);
    }));
    it('should call submit every time the value changes after the value has been set initially', fakeAsync(() => {
      valueSpy.and.callFake(() => Promise.resolve(true));
      component.ngOnInit();
      tick();
      expect(submitSpy).toHaveBeenCalledTimes(0);
      component.fc.setValue(false);
      expect(submitSpy).toHaveBeenCalledTimes(1);
      component.fc.setValue(true);
      expect(submitSpy).toHaveBeenCalledTimes(2);
    }));

  });

  describe('submit()', () => {
    let setRememberOnDeviceSpy;
    beforeEach(() => {
      setRememberOnDeviceSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      component.submitting = false;
      component.fc = new FormControl(true);
      spyOnProperty(component, 'authService').and.returnValue({setRememberOnDevice: setRememberOnDeviceSpy});
    });

    it('should set submitting if the api call succeeds', fakeAsync(() => {
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
    }));
    it('should set submitting if the api call fails', fakeAsync(() => {
      setRememberOnDeviceSpy.and.callFake(() => Promise.reject({}));
      component.submit();
      expect(component.submitting).toBe(true);
      tick();
      expect(component.submitting).toBe(false);
    }));

  });


});
