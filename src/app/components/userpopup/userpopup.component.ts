import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyUserData } from 'src/services/user.service';

@Component({
  selector: 'app-userpopup',
  templateUrl: './userpopup.component.html',
  styleUrls: ['./userpopup.component.css'],
})
export class UserpopupComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MyUserData) {}

  ngOnInit(): void {
    console.log(this.data);
  }
}
