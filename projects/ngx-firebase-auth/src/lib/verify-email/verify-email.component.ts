import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth, User } from 'firebase/app';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import {
  NgxFirebaseAuthOAuthMethod,
  NgxFirebaseAuthRoute,
  ngxFirebaseAuthRouteSlugs, NGX_FIREBASE_AUTH_OPTIONS, INgxFirebaseAuthOptions
} from '../shared';

@Component({
  selector: 'ngx-firebase-auth-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  user: User = null;
  screen: 'wait' | 'success' | 'error' = 'wait';
  error: auth.Error = null;

  constructor(
    @Inject(NGX_FIREBASE_AUTH_OPTIONS) private _options: INgxFirebaseAuthOptions,
    private _afAuth: AngularFireAuth,
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  get options(): INgxFirebaseAuthOptions {
    return this._options;
  }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  get authState(): Observable<User> {
    return this._afAuth.authState;
  }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  get route(): ActivatedRoute {
    return this._route;
  }

  get queryParams(): {[key: string]: any} {
    return this.route.snapshot.queryParams;
  }

  get router(): Router {
    return this._router;
  }

  ngOnInit() {
    this.authService.setRoute(NgxFirebaseAuthRoute.verifyEmail);
    this.submit();
  }

  submit() {
    this.screen = 'wait';
    this.error = null;
    this.authState.pipe(take(1))
      .subscribe((user: User) => {
        if (! user) {
          this.router.navigate(['../', 'sign-in'], {relativeTo: this.route});
          return;
        }
        this.user = user;
        if (user.emailVerified) {
          this.screen = 'success';
          return;
        }
        user.sendEmailVerification()
          .then(() => {
            console.log('got here');
            this.screen = 'success';
          })
          .catch((error: auth.Error) => {
            this.error = error;
            this.screen = 'error';
          });
      });
  }

}
