import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet,  NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'skmsys';
}
