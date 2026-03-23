import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Menu } from './menu/menu';
import { HeaderComponent } from './header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Menu, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  protected readonly title = signal('odontologia-frontend');

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => {
        console.log('Router event:', event);
        return event instanceof NavigationEnd;
      }),
      map(event => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  protected showMenu = computed(() => {
    const url = this.currentUrl();
    return url ? !url.includes('/login') : true;
  });
}
