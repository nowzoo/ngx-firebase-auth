import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpPasswordFormComponent } from './sign-up-password-form.component';

describe('SignUpPasswordFormComponent', () => {
  let component: SignUpPasswordFormComponent;
  let fixture: ComponentFixture<SignUpPasswordFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignUpPasswordFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
