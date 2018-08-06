import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-firebase-auth-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {
  @Input() context: 'wait' | 'success' | 'error';
}
