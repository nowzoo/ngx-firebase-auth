import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SignUpFormComponent } from './sign-up-form.component';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';

describe('SignUpFormComponent', () => {
  let component: SignUpFormComponent;
  let fixture: ComponentFixture<SignUpFormComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignUpFormComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}}
      ]
    })
    .overrideTemplate(SignUpFormComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(SignUpFormComponent);
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
    let rememberChangeSpy;
    beforeEach(() => {
      component.email = 'foo@bar.com';
      component.remember = true;
      rememberChangeSpy = spyOn(component.rememberChange, 'emit').and.callThrough();
    });
    it('should emit on remember change', () => {
      component.ngOnInit();
      component.rememberFc.setValue(false);
      expect(rememberChangeSpy).toHaveBeenCalledWith(false);
      component.rememberFc.setValue(true);
      expect(rememberChangeSpy).toHaveBeenCalledWith(true);
    });
    it('should set up fg', () => {
      component.ngOnInit();
      expect(component.emailFc.value).toBe(component.email);
      expect(component.fg.get('email')).toBe(component.emailFc);
      expect(component.passwordFc.value).toBe('');
      expect(component.fg.get('password')).toBe(component.passwordFc);
      expect(component.rememberFc.value).toBe(component.remember);
      expect(component.fg.get('remember')).toBe(component.rememberFc);
      expect(component.nameFc.value).toBe('');
      expect(component.fg.get('name')).toBe(component.nameFc);
    });
  });
  describe('ngAfterViewInit()', () => {
    let elRef;
    beforeEach(() => {
      elRef = {nativeElement: {focus: jasmine.createSpy()}};
    });
    it('should focus the input', () => {
      component.passwordInput = elRef;
      component.ngAfterViewInit();
      expect(elRef.nativeElement.focus).toHaveBeenCalled();
    });
  });

  describe('submit()', () => {
    let cred, user;
    let fetchSignInMethodsForEmailSpy;
    let createUserWithEmailAndPasswordSpy;
    let userProfileUpdateSpy;
    let setRememberedSpy;
    let successEmitSpy;
    let errorEmitSpy;
    beforeEach(() => {
      component.email = 'foo@bar.com';
      userProfileUpdateSpy = jasmine.createSpy().and.returnValue(() => Promise.resolve());
      user = {updateProfile:  userProfileUpdateSpy};
      cred = {user: user};
      fetchSignInMethodsForEmailSpy = jasmine.createSpy().and.callFake(() => Promise.resolve([]));
      createUserWithEmailAndPasswordSpy = jasmine.createSpy().and.callFake(() => Promise.resolve(cred));
      setRememberedSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      component.emailFc = new FormControl('foo@bar.com');
      component.passwordFc = new FormControl('password');
      component.nameFc = new FormControl('Foo Bar');
      component.rememberFc = new FormControl(true);
      spyOnProperty(component, 'auth').and.returnValue({
        fetchSignInMethodsForEmail: fetchSignInMethodsForEmailSpy,
        createUserWithEmailAndPassword: createUserWithEmailAndPasswordSpy
      });
      spyOnProperty(component, 'authService').and.returnValue({
        setRemembered: setRememberedSpy,
      });
      successEmitSpy = spyOn(component.success, 'emit').and.callThrough();
      errorEmitSpy = spyOn(component.error, 'emit').and.callThrough();
    });
    it('should handle success', fakeAsync(() => {
      component.submit();
      expect(component.submitting).toBe(true);
      expect(fetchSignInMethodsForEmailSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(createUserWithEmailAndPasswordSpy).toHaveBeenCalledWith('foo@bar.com', 'password');
      expect(userProfileUpdateSpy).toHaveBeenCalledWith({displayName: 'Foo Bar', photoURL: null});
      expect(setRememberedSpy).toHaveBeenCalledWith(true, 'foo@bar.com');
      expect(successEmitSpy).toHaveBeenCalledWith(cred);
    }));

    it('should handle the case when the email has  sign in methods', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['password']));
      component.submit();
      tick();
      expect(component.emailFc.hasError('ngx-firebase-auth/account-exists')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('ngx-firebase-auth/account-exists')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));

    it('should handle the case when fetchSignInMethodsForEmail returns auth/invalid-email', fakeAsync(() => {
      const error = {code: 'auth/invalid-email'};
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));

    it('should handle auth/weak-password error', fakeAsync(() => {
      const error = {code: 'auth/weak-password'};
      createUserWithEmailAndPasswordSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.submitting).toBe(false);
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(true);
      component.passwordFc.setValue('foo');
      expect(component.passwordFc.hasError('auth/weak-password')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should handle unknown error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      createUserWithEmailAndPasswordSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.submitting).toBe(false);
      expect(errorEmitSpy).toHaveBeenCalledWith(error);
    }));
  });



});
