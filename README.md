# NgxFirebaseAuth

Angular components for email-first sign in and out-of-band (oob) actions (reset password, etc).

A work in progress.

## Install
```bash
npm i @nowzoo/ngx-firebase-auth --save
```

## Component API

### Sign In Component

- selector: `ngx-firebase-auth-sign-in`
- Inputs
   - `oAuthProviderIds: string[]` Optional. The ids of OAuth providers you want to enable.
   - `oAuthProviderFactory: (providerId: string) => auth.AuthProvider` Optional. Pass your function for creating providers. If no function is provided here, or the function does not return a provider for a particular provider id, the component will create a default provider.
   - `useOAuthPopup: boolean` Optional. Default: false. Whether or not to use a popup rather than a redirect for OAuth sign in. See the example app, which uses [ngx-device-detector](https://github.com/KoderLabs/ngx-device-detector) to choose which method to use.
   - `tosTemplate: TemplateRef<any>` Optional. The HTML in this template is appended to the component.
- Outputs
   - `success: EventEmitter<auth.UserCredential>`
   - `mode: EventEmitter<'signIn' | 'resetPassword'>` Use this to set the route title.

#### Sign In Component Notes

- Only the OAuth providers you pass in `oAuthProviderIds` will be shown as sign up options for new users.
- For existing users, all oAuth providers for that user will be displayed as sign in options.
- Only the `password` and  the Twitter, Google, GitHub and Facebook providers are currently supported.

#### Sign In Component Usage
Import `NgxFirebaseAuthSignInModule` into the module which contains your sign in route...

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgxFirebaseAuthSignInModule } from '@nowzoo/ngx-firebase-auth';

import { RouteComponent } from './route/route.component';

const routes: Routes = [
  {path: '', component: RouteComponent}
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxFirebaseAuthSignInModule
  ],
  declarations: [RouteComponent]
})
export class SignInModule { }
```

Stick an instance of the sign in component into the HTML of your component...
```html
<!-- route.component.html -->
<ng-template #tos>
  By signing in or signing up for example.com, you agree to our
  <a href="/tos">Terms of Service</a> and
  <a href="/privacy">Privacy Policy</a>.
</ng-template>

<div class="row">
  <div class="col-sm-8 offset-md-2 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
    <h1>{{routeTitle}}</h1>
    <hr>
    <ngx-firebase-auth-sign-in
      [oAuthProviderIds]="['google.com']"
      [tosTemplate]="tos"
      [useOAuthPopup]="deviceDetector.isDesktop()"
      (success)="onSuccess($event)"
      (mode)="onMode($event)">
    </ngx-firebase-auth-sign-in>
  </div>
</div>
```
...and handle the outputs in your component code...
```ts
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
```


### Oob Component

- selector: `ngx-firebase-auth-oob`
- Inputs (none)
- Outputs
   - `success:  EventEmitter<INgxFirebaseAuthOobSuccess>` See below.
   - `navigationError: EventEmitter<void>` Emitted when one or more of the oob parameters (`oobCode` and `mode`) is messing from the querystring. You should handle this by redirecting the user in some way.
   - `mode: EventEmitter<'resetPassword' | 'verifyEmail' | 'recoverEmail'>` Use this to set the window or route title.

### Oob Component Notes

#### Interface `INgxFirebaseAuthOobSuccess`
- `mode: 'resetPassword' | 'verifyEmail' | 'recoverEmail'`;
- `info: auth.ActionCodeInfo`
- `cred?: auth.UserCredential` Only populated on reset password, when we sign the user in after saving the password.
- `user?: User` Populated if the user is signed in.

#### Oob Component Usage
 Import `NgxFirebaseAuthOobModule` into the module which contains your sign in route...

 ```ts
 import { NgModule } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { RouterModule, Routes } from '@angular/router';
 import { NgxFirebaseAuthOobModule } from '@nowzoo/ngx-firebase-auth';
 import { RouteComponent } from './route/route.component';

 const routes: Routes = [
   {path: '', component: RouteComponent}
 ];

 @NgModule({
   imports: [
     CommonModule,
     RouterModule.forChild(routes),
     NgxFirebaseAuthOobModule
   ],
   declarations: [RouteComponent]
 })
 export class OobModule { }
 ```


 Stick an instance of the oob component into the HTML of your component...

```html
<!-- route.component.html -->
<div class="row">
  <div class="col-sm-8 offset-md-2 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
    <h1>
      {{routeTitle}}
    </h1>
    <hr>
    <ngx-firebase-auth-oob
      (mode)="onMode($event)"
      (navigationError)="onNavigationError()"
      (success)="onSuccess($event)">
    </ngx-firebase-auth-sign-in>
  </div>
</div>
```
... and handle the outputs in your code...

```ts
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
```


## Development
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.7.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
