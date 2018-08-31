import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { OobResetPasswordComponent } from './oob-reset-password.component';
import { AngularFireAuth } from 'angularfire2/auth';

describe('OobResetPasswordComponent', () => {
  let component: OobResetPasswordComponent;
  let fixture: ComponentFixture<OobResetPasswordComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ OobResetPasswordComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
      ]
    })
    .overrideTemplate(OobResetPasswordComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(OobResetPasswordComponent);
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
  });

  describe('ngOnInit', () => {
    let actionCodeInfo;
    let checkActionCodeSpy;
    let oobCode;
    beforeEach(() => {
      component.oobCode = oobCode = 'foo-bar';
      actionCodeInfo = {data: {email: 'foo@bar.com'}};
      checkActionCodeSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(actionCodeInfo));
      spyOnProperty(component, 'auth').and.returnValue({
        checkActionCode: checkActionCodeSpy,
      });
    });
    it('should handle success', fakeAsync(() => {
      component.ngOnInit();
      expect(checkActionCodeSpy).toHaveBeenCalledWith(oobCode);
      tick();
      expect(component.emailFc.value).toBe('foo@bar.com');
      expect(component.info).toBe(actionCodeInfo);
      expect(component.screen).toBe('form');
    }));
    it('should handle checkActionCode error', fakeAsync(() => {
      const error = new Error('foo');
      checkActionCodeSpy.and.callFake(() => Promise.reject(error));
      component.ngOnInit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));
  });

  describe('submit()', () => {
    let actionCodeInfo;
    let signInSpy;
    let confirmPasswordResetSpy;
    let setRememberedSpy;
    let successSpy;
    let oobCode;
    let cred, user;
    beforeEach(() => {
      user = {};
      cred = {user: user};
      component.emailFc = new FormControl('foo@bar.com');
      component.passwordFc = new FormControl('password');
      component.rememberFc = new FormControl(true);
      component.oobCode = oobCode = 'foo-bar';
      component.info = actionCodeInfo = {data: {email: 'foo@bar.com'}} as any;
      signInSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      confirmPasswordResetSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      setRememberedSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      spyOnProperty(component, 'auth').and.returnValue({
        confirmPasswordReset: confirmPasswordResetSpy,
        signInWithEmailAndPassword: signInSpy
      });
      spyOnProperty(component, 'authService').and.returnValue({
        setRemembered: setRememberedSpy,
      });
      successSpy = spyOn(component.success, 'emit').and.callThrough();
      component.screen = 'form';
    });
    it('should handle success', fakeAsync(() => {
      component.submit();
      expect(confirmPasswordResetSpy).toHaveBeenCalledWith(oobCode, 'password');
      tick();
      expect(component.screen).toBe('success');
      expect(signInSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(setRememberedSpy).toHaveBeenCalledWith(true, 'foo@bar.com');
      expect(successSpy).toHaveBeenCalledWith({
        mode: 'resetPassword',
        info: actionCodeInfo,
        cred: cred,
        user: user
      });
      expect(component.cred).toBe(cred);

    }));
    it('should handle unknown confirmPasswordReset error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      confirmPasswordResetSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.screen).toBe('error');
      expect(component.unhandledError).toBe(error);
    }));
    it('should handle auth/weak-password confirmPasswordReset error', fakeAsync(() => {
      const error = {code: 'auth/weak-password'};
      confirmPasswordResetSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.screen).toBe('form');
      expect(component.unhandledError).toBe(null);
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(true);
      component.passwordFc.setValue('foo');
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(false);

    }));
  });

});
