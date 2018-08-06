import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './index/index.component';

const routes: Routes = [
  {path: '', component: IndexComponent}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [IndexComponent]
})
export class HomeModule { }
