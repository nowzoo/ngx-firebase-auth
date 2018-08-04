import { InjectionToken } from '@angular/core';

import { UserCredential } from 'firebase/auth';
import { auth } from 'firebase/app';


export interface INgxFirebaseAuthOobResult {
  mode: 'resetPassword' | 'recoverEmail' | 'verifyEmail';
  code: string;
  email: string;
  fromEmail: string;
  error: auth.Error;
}

export enum NgxFirebaseAuthOAuthMethod {
  redirect,
  popup
}

export enum NgxFirebaseAuthRoute {
  none,
  signIn,
  signOut,
  oob,
  oobResetPassword,
  oobVerifyEmail,
  oobRecoverEmail,
  resetPassword,
  verifyEmail
}

export const ngxFirebaseAuthRouteSlugs = {
  signIn: 'sign-in',
  signOut: 'sign-out',
  oob: 'oob',
  oobResetPassword: 'oob-reset-password',
  oobVerifyEmail: 'oob-verify-email',
  oobRecoverEmail: 'oob-recover-email',
  resetPassword: 'reset-password',
  verifyEmail: 'verify-email'
};

export interface INgxFirebaseAuthOptions {
  methods: string[];
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
