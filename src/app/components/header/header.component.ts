import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
@Component({
 selector: 'app-header',
 standalone: true,
 templateUrl: './header.component.html',
 styleUrls: ['./header.component.css'],
 imports: [ClarityModule, CommonModule]
})
export class HeaderComponent implements OnInit {
 username: string = '';
 constructor(private router: Router) {}
 ngOnInit() {
   this.username = localStorage.getItem('username') || 'User';
 }
 logout() {
   localStorage.clear(); // Clear everything
   this.router.navigate(['/login']);
 }
}