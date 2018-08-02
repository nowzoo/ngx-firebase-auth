import { Component } from '@angular/core';
import { NgxFirebaseAuthMethodsByEmail } from '@nowzoo/ngx-firebase-auth';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  results: NgxFirebaseAuthMethodsByEmail;
}
