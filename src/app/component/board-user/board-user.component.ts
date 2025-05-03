import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "./user-nav/user-nav.component";

@Component({
  selector: 'app-board-user',
  templateUrl: './board-user.component.html',
  imports: [
    RouterModule,
    NavbarComponent
],
  styleUrls: ['./board-user.component.css']
})
export class UserAreaComponent implements OnInit {

  content!: string;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUserBoard().subscribe(
      data => {
        this.content = data;
      },
      err => {
        this.content = JSON.parse(err.error).message;
      }
    );
  }

}
