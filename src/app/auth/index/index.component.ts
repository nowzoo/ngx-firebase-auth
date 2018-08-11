import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { auth, User } from 'firebase/app';
import * as firebaseui from 'firebaseui';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  screen: 'signIn' | 'signOut';
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const fragment = this.route.snapshot.fragment;
    if ('signOut' === fragment) {
      this.screen = 'signOut';
      this.afAuth.auth.signOut().then(() => {
        this.router.navigate(['.'], {relativeTo: this.route, preserveFragment: false});
        this.screen = 'signIn';
      });
    } else {
      this.screen = 'signIn';
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSignedIn(event) {
    console.log(event);
    this.router.navigate(['/']);
  }


}
