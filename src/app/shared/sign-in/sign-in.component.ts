import { Component, OnInit } from '@angular/core';
import { EmailSignInMethodsResult } from '../interfaces';

@Component({
  selector: 'ngx-firebase-auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

  emailSignInMethods: EmailSignInMethodsResult = {fetched: false, methods: [], email: ''};

  constructor() { }

  get emailHasAccount(): boolean {
    return this.emailSignInMethods.methods.length > 0;
  }

  get emailHasPassword(): boolean {
    return this.emailSignInMethods.methods.indexOf('password') !== -1;
  }

  ngOnInit() {
  }

  onEmailSignInMethodsResult(result: EmailSignInMethodsResult) {
    this.emailSignInMethods = result;
  }

}
