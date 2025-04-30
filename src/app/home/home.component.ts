import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { RouterModule } from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {ProductCategoryComponent} from '../component/product-category/product-category.component';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [RouterModule, MatListModule, ProductCategoryComponent]
})
export class HomeComponent implements OnInit {

  content!: string;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getPublicContent().subscribe(
      data => {
        this.content = data;
      },
      err => {
        this.content = JSON.parse(err.error).message;
      }
    );
  }

}
