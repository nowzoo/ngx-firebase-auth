import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInMethodsFormComponent } from './sign-in-methods-form.component';

describe('SignInMethodsFormComponent', () => {
  let component: SignInMethodsFormComponent;
  let fixture: ComponentFixture<SignInMethodsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInMethodsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInMethodsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
