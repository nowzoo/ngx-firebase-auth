import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { screenAnimation } from '../shared';
import { INgxFirebaseAuthOobSuccess } from '../shared';


@Component({
  selector: 'ngx-firebase-auth-oob',
  templateUrl: './oob.component.html',
  styleUrls: ['./oob.component.scss'],
  animations: [screenAnimation]
})
export class OobComponent implements OnInit {

  oobCode: string;
  screen: 'resetPassword' | 'verifyEmail' | 'recoverEmail' = null;

  @Output() mode: EventEmitter<'resetPassword' | 'verifyEmail' | 'recoverEmail'>  = new EventEmitter();
  @Output() navigationError: EventEmitter<void>  = new EventEmitter();
  @Output() success: EventEmitter<INgxFirebaseAuthOobSuccess> = new EventEmitter();


  constructor(
    private _route: ActivatedRoute,
  ) { }


  get queryParams(): {[key: string]: any} {
    return this._route.snapshot.queryParams;
  }


  ngOnInit() {
    this.oobCode = this.queryParams.oobCode || null;
    if (! this.oobCode) {
      this.navigationError.emit();
      return;
    }
    switch (this.queryParams.mode) {
      case 'resetPassword':
      case 'verifyEmail':
      case 'recoverEmail':
        this.screen = this.queryParams.mode;
        this.mode.emit(this.queryParams.mode);
        break;
      default:
        this.navigationError.emit();
        break;
    }

  }
}
