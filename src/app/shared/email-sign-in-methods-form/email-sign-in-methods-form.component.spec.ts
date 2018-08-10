import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSignInMethodsFormComponent } from './email-sign-in-methods-form.component';

describe('EmailSignInMethodsFormComponent', () => {
  let component: EmailSignInMethodsFormComponent;
  let fixture: ComponentFixture<EmailSignInMethodsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailSignInMethodsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailSignInMethodsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
