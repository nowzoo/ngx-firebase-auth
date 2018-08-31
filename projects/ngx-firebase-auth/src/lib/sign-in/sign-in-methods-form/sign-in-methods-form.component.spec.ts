import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { SignInMethodsFormComponent } from './sign-in-methods-form.component';
import { AngularFireAuth } from 'angularfire2/auth';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';


describe('SignInMethodsFormComponent', () => {
  let component: SignInMethodsFormComponent;
  let fixture: ComponentFixture<SignInMethodsFormComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInMethodsFormComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
        {provide: NgxFirebaseAuthService, useValue: {}}
      ]
    })
    .overrideTemplate(SignInMethodsFormComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(SignInMethodsFormComponent);
    component = fixture.componentInstance;
  });

  describe('getters', () => {
    it('should have auth', () => {
      expect(component.auth).toBeTruthy();
    });
    it('should have authService', () => {
      expect(component.authService).toBeTruthy();
    });
    it('should have methods', () => {
      expect(component.methods).toBeTruthy();
    });
    it('should have methodsFetched', () => {
      expect(component.methodsFetched).toBe(false);
    });
    it('should have accountIsNew', () => {
      expect(component.accountIsNew).toBe(false);
    });
    it('should have accountExists', () => {
      expect(component.accountExists).toBe(false);
    });
    it('should have accountHasPassword', () => {
      expect(component.accountHasPassword).toBe(false);
    });
    it('should have accountOAuthMethods', () => {
        expect(component.accountOAuthMethods).toBeTruthy();
    });
    it('should have fetchStatus', () => {
        expect(component.fetchStatus).toBeTruthy();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    let emailChangeSpy;
    let rememberChangeSpy;
    let fetchSpy;
    beforeEach(() => {
      component.email = 'foo@bar.com';
      component.remember = true;
      rememberChangeSpy = spyOn(component.rememberChange, 'emit').and.callThrough();
      emailChangeSpy = spyOn(component.emailChange, 'emit').and.callThrough();
      fetchSpy = spyOn(component, 'fetch').and.callFake(() => {});
    });
    it('should emit on email change', () => {
      component.ngOnInit();
      component.emailFc.setValue('fff');
      expect(emailChangeSpy).toHaveBeenCalledWith('fff');
    });
    it('should emit on remember change', () => {
      component.ngOnInit();
      component.rememberFc.setValue(false);
      expect(rememberChangeSpy).toHaveBeenCalledWith(false);
    });
    it('should set up fg', () => {
      component.ngOnInit();
      expect(component.emailFc.value).toBe('foo@bar.com');
      expect(component.fg.get('email')).toBe(component.emailFc);
    });
    it('should call fetch when the email changes, debounced', fakeAsync(() => {
      component.ngOnInit();
      component.emailFc.setValue('barr@foo.com');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      tick(500);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    }));
  });

  describe('ngAfterViewInit()', () => {
    let elRef;
    beforeEach(() => {
      elRef = {nativeElement: {focus: jasmine.createSpy()}};
    });
    it('should focus the input', () => {
      component.emailInput = elRef;
      component.ngAfterViewInit();
      expect(elRef.nativeElement.focus).toHaveBeenCalled();
    });
  });

  describe('fetch()', () => {
    let fetchSignInMethodsForEmailSpy;
    beforeEach(() => {
      fetchSignInMethodsForEmailSpy = jasmine.createSpy();
      spyOnProperty(component, 'auth').and.returnValue({
        fetchSignInMethodsForEmail: fetchSignInMethodsForEmailSpy
      });
      component.emailFc = new FormControl('foo@bar.com');
    });
    it('should handle the case where the email has a password and some oAuth methods', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['password', 'twitter.com', 'google.com']));
      component.fetch();
      tick();
      expect(component.accountExists).toBe(true);
      expect(component.accountIsNew).toBe(false);
      expect(component.accountHasPassword).toBe(true);
      expect(component.accountOAuthMethods).toEqual(['twitter.com', 'google.com']);
      expect(component.methodsFetched).toBe(true);
    }));
    it('should handle the case where the email has some oAuth methods but no password', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve(['twitter.com', 'google.com']));
      component.fetch();
      tick();
      expect(component.accountExists).toBe(true);
      expect(component.accountIsNew).toBe(false);
      expect(component.accountHasPassword).toBe(false);
      expect(component.accountOAuthMethods).toEqual(['twitter.com', 'google.com']);
      expect(component.methodsFetched).toBe(true);
    }));
    it('should handle the case where the mail has no methods', fakeAsync(() => {
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.resolve([]));
      component.fetch();
      tick();
      expect(component.accountExists).toBe(false);
      expect(component.accountIsNew).toBe(true);
      expect(component.accountHasPassword).toBe(false);
      expect(component.accountOAuthMethods).toEqual([]);
      expect(component.methodsFetched).toBe(true);
    }));
    it('should not fetch if the email fc is invalid', fakeAsync(() => {
      component.emailFc.setErrors({foo: true});
      component.fetch();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
      expect(component.methodsFetched).toBe(false);
    }));
    it('should not fetch if the email fc the same as the last fetched email', fakeAsync(() => {
      component.emailFc.setValue('a@b.com');
      component.methodsForEmail = {email: 'a@b.com', methods: [], status: 'fetched'};
      component.fetch();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
    }));
    it('should not fetch if the status is fetching', fakeAsync(() => {
      component.methodsForEmail = {email: 'a@b.com', methods: [], status: 'fetching'};
      component.fetch();
      expect(fetchSignInMethodsForEmailSpy).not.toHaveBeenCalled();
    }));
    it('should handle auth/invalid-email', fakeAsync(() => {
      const error = {code: 'auth/invalid-email'};
      fetchSignInMethodsForEmailSpy.and.callFake(() => Promise.reject(error));
      component.fetch();
      tick();
      expect(component.methodsFetched).toBe(false);
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(false);
    }));
  });
});
