import { Component, OnInit, Input } from '@angular/core';
import { NgxFirebaseAuthService } from '../../ngx-firebase-auth.service';

@Component({
  selector: 'ngx-firebase-auth-sign-in-oauth-links',
  templateUrl: './sign-in-oauth-links.component.html',
  styleUrls: ['./sign-in-oauth-links.component.css']
})
export class SignInOauthLinksComponent implements OnInit {

  @Input() oAuthMethods: string[];
  @Input() context: 'signIn' | 'signUp';

  constructor(
    private _authService: NgxFirebaseAuthService
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {

  }

}
