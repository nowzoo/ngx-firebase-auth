import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { auth, User } from 'firebase/app';
import * as firebaseui from 'firebaseui';

@Component({
  selector: 'app-firebase-ui',
  templateUrl: './firebase-ui.component.html',
  styleUrls: ['./firebase-ui.component.css']
})
export class FirebaseUiComponent implements OnInit {

  constructor(
    private _afAuth: AngularFireAuth,
    private _elementRef: ElementRef,
    private _router: Router
  ) { }

  ngOnInit() {
    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: this.onSignInSuccess.bind(this),
        signInFailure: this.onSignInFailure.bind(this)
      },
      signInSuccessUrl: '../success',
      signInOptions: [
        auth.GoogleAuthProvider.PROVIDER_ID,
        auth.EmailAuthProvider.PROVIDER_ID,
      ],
      // Terms of service url.
      tosUrl: '../tos',
      // Privacy policy url.
      privacyPolicyUrl: '../privacy'
    };
    const ui = new firebaseui.auth.AuthUI(this._afAuth.auth);
    // The start method will wait until the DOM is loaded.
    ui.start(this._elementRef.nativeElement, uiConfig);
  }


  onSignInSuccess(authResult) {
    this._router.navigate(['/']);
    return false;
  }
  onSignInFailure(error) {
    console.log('onSignInFailure', error);
    return Promise.resolve();
  }

}
