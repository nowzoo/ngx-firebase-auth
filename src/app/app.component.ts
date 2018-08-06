import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user: any = null;
  constructor(
    private afAuth: AngularFireAuth
  ) {
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => this.user = user);
  }
}
