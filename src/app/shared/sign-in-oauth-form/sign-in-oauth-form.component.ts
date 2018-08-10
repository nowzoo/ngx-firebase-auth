import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { NgxFormUtils } from '@nowzoo/ngx-form';
import { EmailSignInMethodsResult } from '../interfaces';

@Component({
  selector: 'ngx-firebase-auth-sign-in-oauth-form',
  templateUrl: './sign-in-oauth-form.component.html',
  styleUrls: ['./sign-in-oauth-form.component.css']
})
export class SignInOauthFormComponent implements OnInit {

  @Input() oAuthProviderFactory: (id: string) => auth.AuthProvider = null;
  @Input() oAuthMethods: string[] = [];
  @Input() oAuthPopupEnabled = false;
  @Input() emailSignInMethods: EmailSignInMethodsResult;
  @Input() checkForRedirect: boolean;

  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();
  @Output() redirectCheckComplete: EventEmitter<auth.UserCredential | null> = new EventEmitter();

  constructor(
    private _afAuth: AngularFireAuth,
    private _ngZone: NgZone
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  ngOnInit() {
    if (! this.checkForRedirect) {
      return;
    }
    this.auth.getRedirectResult()
      .then();
  }

  getOAuthProvider(id: string): auth.AuthProvider {
    if (this.oAuthProviderFactory) {
      return this.oAuthProviderFactory(id);
    }
    switch (id) {
      case 'twitter.com': return new auth.TwitterAuthProvider();
      case 'facebook.com': return new auth.FacebookAuthProvider();
      case 'github.com': return new auth.GithubAuthProvider();
      case 'google.com': return new auth.GoogleAuthProvider();
    }
    throw new Error(`Could not create a provider for "${id}".`);
  }

  getOAuthProviderName(id: string) {
    switch (id) {
      case 'twitter.com': return 'Twitter';
      case 'facebook.com': return 'Facebook';
      case 'github.com': return 'GitHub';
      case 'google.com': return 'Google';
      default: return id;
    }
  }
  getOAuthProviderIconClass(id: string) {
    switch (id) {
      case 'twitter.com': return 'fab fa-fw fa-twitter';
      case 'facebook.com': return 'fab fa-fw fa-facebook';
      case 'github.com': return 'fab fa-fw fa-github';
      case 'google.com': return 'fab fa-fw fa-google';
      default: return 'fas fa-fw fa-sign-in-alt';
    }
  }

}
