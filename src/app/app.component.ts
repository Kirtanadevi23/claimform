import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { ToastComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, AppHeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'claimform';

  constructor(private router: Router) {}

  showHeader(): boolean {
    const url = this.router.url.split('?')[0]; // Ignore query params
    
    // Check if URL is login, root, or any review page (contains review)
    if (url === '/login' || url === '/') return false;
    if (url.includes('-review')) return false;

    return true;
  }
}