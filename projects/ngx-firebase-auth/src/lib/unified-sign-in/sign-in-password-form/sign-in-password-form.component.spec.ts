import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInPasswordFormComponent } from './sign-in-password-form.component';

describe('SignInPasswordFormComponent', () => {
  let component: SignInPasswordFormComponent;
  let fixture: ComponentFixture<SignInPasswordFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInPasswordFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
