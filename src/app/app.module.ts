import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { NGX_FIREBASE_AUTH_OPTIONS, INgxFirebaseAuthOptions } from '@nowzoo/ngx-firebase-auth';
import { AppComponent } from './app.component';

const authOptions: INgxFirebaseAuthOptions = {
  oAuthMethods: ['google.com']
};

const routes: Routes = [
  {path: 'auth', loadChildren: './auth/auth.module#AuthModule'},
  {path: '', loadChildren: './home/home.module#HomeModule'},
];
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
  ],
  providers: [
    {provide: NGX_FIREBASE_AUTH_OPTIONS, useValue: authOptions}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
