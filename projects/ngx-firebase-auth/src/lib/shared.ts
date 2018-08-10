import { InjectionToken } from '@angular/core';
import { auth, User } from 'firebase/app';

export enum NgxFirebaseAuthRoute {
  none,
  auth,
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


export interface INgxFirebaseActionCodeSuccess {
  actionCodeInfo: auth.ActionCodeInfo;
  user: User;
}

export interface EmailSignInMethodsResult {
  email: string;
  methods: string[];
}





export enum NgxFirebaseAuthOAuthMethod {
  redirect,
  popup
}


export interface INgxFirebaseAuthOptions {
  signInMethods: string[];
  oAuthProviderFactory?: (providerId: string) => auth.AuthProvider;
  sendEmailVerificationOnSignUp?: boolean;
}


export const NGX_FIREBASE_AUTH_OPTIONS = new InjectionToken<INgxFirebaseAuthOptions>(
  'The options for NgxFirebaseAuthModule. See INgxFirebaseAuthOptions.'
);
