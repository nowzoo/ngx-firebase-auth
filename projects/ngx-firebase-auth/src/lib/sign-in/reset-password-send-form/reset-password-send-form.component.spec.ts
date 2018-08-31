import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularFireAuth } from 'angularfire2/auth';
import { ResetPasswordSendFormComponent } from './reset-password-send-form.component';
import { FormControl } from '@angular/forms';
describe('ResetPasswordSendFormComponent', () => {
  let component: ResetPasswordSendFormComponent;
  let fixture: ComponentFixture<ResetPasswordSendFormComponent>;



  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswordSendFormComponent ],
      providers: [
        {provide: AngularFireAuth, useValue: {auth: {}}},
      ]
    })
    .overrideTemplate(ResetPasswordSendFormComponent, '')
    .compileComponents();
    fixture = TestBed.createComponent(ResetPasswordSendFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getters', () => {
    it('should have auth', () => {
      expect(component.auth).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    let emailChangeSpy;
    beforeEach(() => {
      component.email = 'foo@bar.com';
      emailChangeSpy = spyOn(component.emailChange, 'emit').and.callThrough();
    });
    it('should emit on email change', () => {
      component.ngOnInit();
      component.emailFc.setValue('fff');
      expect(emailChangeSpy).toHaveBeenCalledWith('fff');
    });
    it('should set up fg', () => {
      component.ngOnInit();
      expect(component.emailFc.value).toBe('foo@bar.com');
      expect(component.fg.get('email')).toBe(component.emailFc);
    });
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



  describe('submit()', () => {
    let sendPasswordResetEmailSpy;
    let errorEmitSpy;
    beforeEach(() => {
      sendPasswordResetEmailSpy = jasmine.createSpy().and.callFake(() => Promise.resolve());
      component.emailFc = new FormControl('foo@bar.com');
      spyOnProperty(component, 'auth').and.returnValue({
        sendPasswordResetEmail: sendPasswordResetEmailSpy
      });
      errorEmitSpy = spyOn(component.error, 'emit').and.callThrough();
    });
    it('should handle success', fakeAsync(() => {
      component.submit();
      expect(component.sent).toBe(null);
      expect(component.submitting).toBe(true);
      expect(sendPasswordResetEmailSpy).toHaveBeenCalledWith('foo@bar.com');
      tick();
      expect(component.sent).toBe('foo@bar.com');
      expect(component.submitting).toBe(false);
    }));

    it('should handle auth/invalid-email error', fakeAsync(() => {
      const error = {code: 'auth/invalid-email'};
      sendPasswordResetEmailSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.sent).toBe(null);
      expect(component.submitting).toBe(false);
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('auth/invalid-email')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should handle auth/user-not-found error', fakeAsync(() => {
      const error = {code: 'auth/user-not-found'};
      sendPasswordResetEmailSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.sent).toBe(null);
      expect(component.submitting).toBe(false);
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(true);
      component.emailFc.setValue('foo');
      expect(component.emailFc.hasError('auth/user-not-found')).toBe(false);
      expect(errorEmitSpy).not.toHaveBeenCalled();
    }));
    it('should handle unknown error', fakeAsync(() => {
      const error = {code: 'auth/foo'};
      sendPasswordResetEmailSpy.and.callFake(() => Promise.reject(error));
      component.submit();
      tick();
      expect(component.sent).toBe(null);
      expect(component.submitting).toBe(false);
      expect(errorEmitSpy).toHaveBeenCalledWith(error);
    }));
  });
});
