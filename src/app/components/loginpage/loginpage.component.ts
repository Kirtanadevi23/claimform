import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';

@Component({
 selector: 'app-loginpage',
 standalone: true,
 imports: [FormsModule, ClarityModule, CommonModule],
 templateUrl: './loginpage.component.html'
})
export class LoginpageComponent {
 email: string = '';
 password: string = '';
 errorMessage: string = '';
 constructor(private authService: AuthService, private router: Router) {}
 login() {
  console.log("button clicked");
   const data = {
     email: this.email,
     password: this.password
   };
   console.log("Sending:", data); 
   this.authService.login(data).subscribe({
     next: (res) => {
       console.log("Success:", res);
       localStorage.setItem('username', res.name);
       this.router.navigate(['/home']);
     },
     error: (err) => {
       console.log("Error:", err);
       this.errorMessage = 'Invalid email or password';
     }
   });
 }
}