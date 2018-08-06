import { InjectionToken } from '@angular/core';

import { UserCredential } from 'firebase/auth';
import { auth, User } from 'firebase/app';



export enum NgxFirebaseAuthOAuthMethod {
  redirect,
  popup
}

export enum NgxFirebaseAuthRoute {
  none,
  auth,
  index,
  signIn,
  oAuthSignIn,
  signUp,
  signOut,
  oob,
  oobResetPassword,
  oobVerifyEmail,
  oobRecoverEmail,
  resetPassword,
  verifyEmail
}


export interface INgxFirebaseAuthOptions {
  oAuthMethods: string[];
  authProviderFactory?: (providerId: string) => auth.AuthProvider;
}


export const NGX_FIREBASE_AUTH_OPTIONS = new InjectionToken<INgxFirebaseAuthOptions>(
  'The options for NgxFirebaseAuthModule. See INgxFirebaseAuthOptions.'
);


export const ngxFirebaseAuthOAuthProviderNames = {
  'twitter.com': 'Twitter',
  'facebook.com': 'Facebook',
  'google.com': 'Google',
  'github.com': 'GitHub',
};

export interface INgxFirebaseActionCodeSuccess {
  actionCodeInfo: auth.ActionCodeInfo;
  user: User;
}
