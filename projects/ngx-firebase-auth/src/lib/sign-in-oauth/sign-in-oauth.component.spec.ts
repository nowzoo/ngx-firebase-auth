import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInOauthComponent } from './sign-in-oauth.component';

describe('SignInOauthComponent', () => {
  let component: SignInOauthComponent;
  let fixture: ComponentFixture<SignInOauthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInOauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInOauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
