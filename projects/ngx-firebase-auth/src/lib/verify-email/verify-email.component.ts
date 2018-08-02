import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFirebaseAuthRoute } from '../shared';
import { auth, User } from 'firebase/app';

@Component({
  selector: 'ngx-firebase-auth-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {


  user: User = null;
  error: auth.Error = null;
  screen: 'wait' | 'error' | 'success' = 'wait';
  constructor(
    private _authService: NgxFirebaseAuthService
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.verifyEmailSend);
    this.authService.authState.pipe(take(1)).subscribe((user) => {
      this.user = user;
      if (! user) {
        this.authService.internalRedirect('sign-in');
      } else {
        this.authService.sendEmailVerification(user)
          .then(() => {
            this.screen = 'success';
          })
          .catch((error: auth.Error) => {
            this.error = error;
            this.screen = 'error';
          });
      }
    });
  }



}
