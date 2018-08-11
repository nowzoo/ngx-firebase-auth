import { Component, OnInit, OnDestroy } from '@angular/core';
import { auth, User } from 'firebase/app';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActivatedRoute, ActivatedRouteSnapshot, UrlSegment } from '@angular/router';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';
import { NgxFormUtils, NgxFormValidators } from '@nowzoo/ngx-form';
import { NgxFirebaseAuthRoute } from '../shared';

@Component({
  selector: 'ngx-firebase-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {

  constructor(
    private _authService: NgxFirebaseAuthService,
    private _route: ActivatedRoute,
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  get route(): ActivatedRoute {
    return this._route;
  }

  ngOnInit() {
    this.authService.setBaseRoute(this.route);
    this.authService.setRoute(NgxFirebaseAuthRoute.auth);
  }

  ngOnDestroy() {
    this.authService.setRoute(NgxFirebaseAuthRoute.none);
  }

}
