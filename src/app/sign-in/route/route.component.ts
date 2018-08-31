import { Component } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
@Component({
  selector: 'app-route',
  templateUrl: './route.component.html',
  styleUrls: ['./route.component.css']
})
export class RouteComponent {

  routeTitle: string = null;
  constructor(
    public deviceDetector: DeviceDetectorService,
    private router: Router
  ) { }


  onMode(mode: 'resetPassword' | 'verifyEmail' | 'recoverEmail') {
    switch (mode) {
      case 'resetPassword':
        this.routeTitle = 'Reset Password';
        break;
      default:
        this.routeTitle = 'Sign In';
        break;
    }
  }

  onSuccess(cred: auth.UserCredential) {
    console.log(cred);
    console.log(`Welcome, ${cred.user.displayName}!`);
    console.log(`You signed in with ${cred.additionalUserInfo.providerId}.`);
    if (cred.additionalUserInfo.isNewUser) {
      console.log(`You are a newly registered user!`);
    } else {
      console.log(`You are a returning user!`);
    }
    this.router.navigate(['/']);
  }

}
