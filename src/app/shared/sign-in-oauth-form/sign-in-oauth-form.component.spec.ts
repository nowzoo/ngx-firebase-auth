import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInOauthFormComponent } from './sign-in-oauth-form.component';

describe('SignInOauthFormComponent', () => {
  let component: SignInOauthFormComponent;
  let fixture: ComponentFixture<SignInOauthFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInOauthFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInOauthFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
