import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { INgxFirebaseAuthOobSuccess } from '@nowzoo/ngx-firebase-auth';
@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.css']
})
export class RouteComponent {

  routeTitle: string = null;
  constructor(
    private router: Router
  ) { }


  onMode(mode: 'resetPassword' | 'verifyEmail' | 'recoverEmail') {
    switch (mode) {
      case 'resetPassword':
        this.routeTitle = 'Reset Password';
        break;
      case 'recoverEmail':
        this.routeTitle = 'Recover Email';
        break;
      case 'verifyEmail':
        this.routeTitle = 'Verify Email';
        break;
    }
  }

  onNavigationError() {
    this.router.navigate(['/']);
  }

  onSuccess(success: INgxFirebaseAuthOobSuccess) {
    switch (success.mode) {
      case 'resetPassword':
        // the user has saved her new password and is signed in...
        console.log(`Welcome, ${success.user.displayName}!`);
        this.router.navigate(['/']);
        break;
      default:
        // etc...
        break;
    }
  }

}
