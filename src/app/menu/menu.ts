import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  protected isCollapsed = signal(false);

  protected toggleMenu() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
