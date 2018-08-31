import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth, User } from 'firebase/app';
import { INgxFirebaseAuthRememberRecord } from './shared';

@Injectable({
  providedIn: 'root'
})
export class NgxFirebaseAuthService {
  static rememberKey = 'ngx-firebase-auth-remember';

  constructor(
    private _afAuth: AngularFireAuth
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }
  get storage(): Storage {
    return window.localStorage;
  }

  getRemembered(): INgxFirebaseAuthRememberRecord {
    const str = this.storage.getItem(NgxFirebaseAuthService.rememberKey);
    if (str) {
      try {
        return JSON.parse(str);
      } catch (e) {
        return {email: '', remember: true};
      }
    }
    return {email: '', remember: true};
  }

  setRemembered(remember: boolean, email: string): Promise<INgxFirebaseAuthRememberRecord> {
    const persistence: auth.Auth.Persistence = remember ?
      auth.Auth.Persistence.LOCAL : auth.Auth.Persistence.SESSION;
    return this.auth.setPersistence(persistence)
      .then(() => {
        const o: INgxFirebaseAuthRememberRecord = {
          email: remember ? email : '',
          remember: remember
        };
        const str = JSON.stringify(o);
        this.storage.setItem(NgxFirebaseAuthService.rememberKey, str);
        return o;
      });
  }



}
