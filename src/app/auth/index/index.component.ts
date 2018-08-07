import { Component, OnInit } from '@angular/core';
import { NgxFirebaseAuthService } from '@nowzoo/ngx-firebase-auth';
import { AngularFireAuth } from 'angularfire2/auth';
import { last } from 'rxjs/operators';
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  constructor(
    private service: NgxFirebaseAuthService,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit() {
    this.afAuth.authState.pipe(last()).subscribe(console.log );
    this.afAuth.authState.subscribe((user) => {
      console.log('in container', user);
    });
  }

}
