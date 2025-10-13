import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { PersonalserviceService } from '../../personalservice.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-internationalform1',
  standalone: true,
  imports: [CommonModule, ClarityModule,FormsModule],
  templateUrl: './internationalform1.component.html',
  styleUrl: './internationalform1.component.css'
})
export class Internationalform1Component {
  personalData: any;
  expenses: any[] = [];
  preview: string | null = null;
  showModal = false;
  today: string = new Date().toISOString().split('T')[0];

  constructor(private service: PersonalserviceService, private router: Router) { }

  ngOnInit() {
    this.personalData = this.service.getDetails();
    this.expenses = this.service.getentries();

    console.log(this.personalData);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.preview = null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  addExpense(form: NgForm) {
    if (form.invalid) return;

    const newEntry = {
      ...form.value,
      preview: this.preview
    };

    this.expenses.push(newEntry);
    this.service.setentries(this.expenses);
    this.closeModal();
    form.resetForm();
  }

  review() {
    console.log('Review data:', this.expenses);
    this.router.navigate(['/internationalform1']);
  }

  cancel() {
    if (confirm('Clear all entries?')) {
      this.expenses = [];
    }
  }
}
  


