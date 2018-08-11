import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';

@Component({
  selector: 'ngx-firebase-auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  email: string;
  screens: string[] = ['signIn', 'signUp', 'resetPassword'];
  screen: string;
  cred: auth.UserCredential = null;
  unhandledError: auth.Error = null;

  @Output() success: EventEmitter<auth.UserCredential> = new EventEmitter();

  constructor(
    private _route: ActivatedRoute,
    private _afAuth: AngularFireAuth
  ) { }

  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }



  ngOnInit() {
    const email = this.queryParams.email || '';
    const action = this.queryParams.action || 'signIn';
    if (action !== 'resetPassword') {
      this.auth.signOut()
        .then(() => {
          this.showScreen({screen: action, email: email});
        });
    } else {
      this.showScreen({screen: action, email: email});
    }
  }

  showScreen(event: {screen: string, email?: string}) {
    this.email = event.email || this.email;
    this.screen = this.screens.indexOf(event.screen) > -1 ? event.screen : 'signIn';
  }

  onSuccess(cred: auth.UserCredential) {
    this.cred = cred;
    this.screen = 'success';
    this.success.emit(cred);
  }

  onError(error: auth.Error) {
    this.unhandledError = error;
    this.screen = 'error';
  }

}
