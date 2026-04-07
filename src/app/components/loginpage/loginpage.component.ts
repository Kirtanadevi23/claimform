import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-loginpage',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ClarityModule],
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.css']
})
export class LoginpageComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // Clear backend error message as soon as user edits anything
    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }
  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }
  login(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const data = {
      email: this.email.value,
      password: this.password.value
    };
    this.authService.login(data).subscribe({
      next: (res) => {
        // Save ONLY the employeeId — like a key/token
        // Everything else we fetch from backend when needed
        localStorage.setItem('employeeId', res.employeeId);
        localStorage.setItem('username', res.name); //  for header name display
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid email or password';
      }
    });
  }
}
