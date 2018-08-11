import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInScreenComponent } from './sign-in-screen.component';

describe('SignInScreenComponent', () => {
  let component: SignInScreenComponent;
  let fixture: ComponentFixture<SignInScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
