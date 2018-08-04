import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { auth } from 'firebase/app';
import { NgxFirebaseAuthService } from '../ngx-firebase-auth.service';

@Component({
  selector: 'ngx-firebase-auth-remember-form',
  templateUrl: './remember-form.component.html',
  styleUrls: ['./remember-form.component.css']
})
export class RememberFormComponent implements OnInit {

  formId: string;
  fc: FormControl;
  submitting = false;
  constructor(
    private _authService: NgxFirebaseAuthService
  ) { }

  get authService(): NgxFirebaseAuthService {
    return this._authService;
  }

  ngOnInit() {
    this.formId = NgxFirebaseAuthService.uniqueId();
    this.authService.getRememberOnDevice()
      .then((remember: boolean) => {
        this.fc = new FormControl(remember);
        this.fc.valueChanges.subscribe(() => {
          this.submit();
        });
      });
  }

  submit() {
    this.submitting = true;
    this.authService.setRememberOnDevice(this.fc.value)
      .then(() => {
        this.submitting = false;
      })
      .catch(() => {
        this.submitting = false;
      });
  }

}
