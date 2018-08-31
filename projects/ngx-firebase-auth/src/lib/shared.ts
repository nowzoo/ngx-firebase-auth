import { trigger, state, style, animate, transition } from '@angular/animations';
import { auth, User } from 'firebase/app';

export interface ISignInMethodsForEmailResult {
  email: string;
  methods: string[];
  status: 'unfetched' | 'fetching' | 'fetched';
}


export interface INgxFirebaseAuthRememberRecord {
  remember: boolean;
  email: string;
}


export const fadeInOutAnimation = trigger('fadeInOut', [
  state('in', style({opacity: 1, display: 'block'})),
  transition('void => *', [
    style({opacity: 0}),
    animate(300)
  ]),
  transition('* => void', [
    animate(300, style({opacity: 0}))
  ])
]);

export const screenAnimation = trigger('screen', [
  state('in', style({opacity: 1})),
  transition('void => *', [
    style({opacity: 0}),
    animate(300)
  ]),
  transition('* => void', [
    animate(0, style({opacity: 0}))
  ])
]);

export const getOAuthProviderName = (id: string): string => {
  switch (id) {
    case 'twitter.com': return 'Twitter';
    case 'facebook.com': return 'Facebook';
    case 'google.com': return 'Google';
    case 'github.com': return 'GitHub';
    default: return id;
  }
};

export const getOAuthProviderIcon = (id: string): string  => {
  switch (id) {
    case 'twitter.com':
    case 'facebook.com':
    case 'google.com':
    case 'github.com':
      return 'fab fa-fw fa-' + id.replace('.com', '');
    default: return 'fas fa-fw fa-sign-in-alt';
  }
};

export interface INgxFirebaseAuthOobSuccess {
  mode: 'resetPassword' | 'verifyEmail' | 'recoverEmail';
  info: auth.ActionCodeInfo;
  cred?: auth.UserCredential;
  user?: User;
}
