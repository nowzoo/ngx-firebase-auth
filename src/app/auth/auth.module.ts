import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './index/index.component';
import { NgxFirebaseAuthModule, NGX_FIREBASE_AUTH_OPTIONS, INgxFirebaseAuthOptions } from '@nowzoo/ngx-firebase-auth';

const routes: Routes = [
  {path: '', component: IndexComponent, loadChildren: () => NgxFirebaseAuthModule}
];

const authOptions: INgxFirebaseAuthOptions = {
  oAuthMethods: ['twitter.com', 'google.com']
};

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [IndexComponent],
  providers: [
    {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: authOptions}
  ]
})
export class AuthModule { }
