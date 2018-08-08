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
