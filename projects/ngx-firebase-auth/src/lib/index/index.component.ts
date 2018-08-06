import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { auth, User } from 'firebase/app';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  selector: 'ngx-firebase-auth-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  user: User = null;
  successMessage: string = null;

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
    this.authService.setRoute(NgxFirebaseAuthRoute.index);
    this.successMessage = this.authService.successMessage || null;
    this.authService.successMessage = null;
    this.authState.pipe(takeUntil(this.ngUnsubscribe)).subscribe((user: User) => {
      this.user = user;
      if (! user) {
        this.router.navigate(this.authService.getSignInRouterLink());
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
