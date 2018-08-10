import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';

@Component({
  selector: 'ngx-firebase-auth-remember-form',
  templateUrl: './remember-form.component.html',
  styleUrls: ['./remember-form.component.css']
})
export class RememberFormComponent implements OnInit {

  static storageKey = 'ngx-firebase-auth-remember';

  formId = 'ngx-firebase-auth-remember-form-';
  rememberFc: FormControl;

  constructor(
    private _afAuth: AngularFireAuth,
    private _ngZone: NgZone
  ) { }

  get auth(): auth.Auth {
    return this._afAuth.auth;
  }

  ngOnInit() {

    this.rememberFc = new FormControl(this.getSavedValue());
    this.rememberFc.valueChanges.subscribe(() => {
      this.onControlChange();
    });
  }

  getSavedValue(): boolean {
    const stored = localStorage.getItem(RememberFormComponent.storageKey);
    return  auth.Auth.Persistence.SESSION !== stored;
  }
  setSavedValue(persistence: auth.Auth.Persistence) {
    localStorage.setItem(RememberFormComponent.storageKey, persistence);
  }

  onControlChange() {
    const persistence = this.rememberFc.value ? auth.Auth.Persistence.LOCAL : auth.Auth.Persistence.SESSION;
    this.auth.setPersistence(persistence)
      .then(() => {
        this.setSavedValue(persistence);
      });
  }

}
