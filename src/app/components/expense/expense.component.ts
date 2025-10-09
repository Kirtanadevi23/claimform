import { Component, Input,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { PersonalserviceService } from '../../personalservice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, FormsModule, ClarityModule],
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {
personalData:any;

  showModal = false;
  preview: string | null = null;
  expenses: any[] = [];
  today: string = new Date().toISOString().split('T')[0];
constructor(private service:PersonalserviceService,private router:Router){}

ngOnInit(){
this.personalData=this.service.getDetails();
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
    this.router.navigate(['/expensereview']);
  }

  cancel() {
    if (confirm('Clear all entries?')) {
      this.expenses = [];
    }
  }
}