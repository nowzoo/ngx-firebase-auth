import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInOauthLinksComponent } from './sign-in-oauth-links.component';

describe('SignInOauthLinksComponent', () => {
  let component: SignInOauthLinksComponent;
  let fixture: ComponentFixture<SignInOauthLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignInOauthLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInOauthLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
