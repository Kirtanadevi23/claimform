import { Component,OnInit } from '@angular/core';
import { PersonalserviceService } from '../../personalservice.service';

import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expensereview',
  standalone: true,
  imports: [ClarityModule,FormsModule,CommonModule],
  templateUrl: './expensereview.component.html',
  styleUrl: './expensereview.component.css'
})
export class ExpensereviewComponent implements OnInit {
 expenses: any[] = [];
personalData:any;
constructor(private service:PersonalserviceService, private router:Router){}
  ngOnInit(): void {
this.personalData=this.service.getDetails();
this.expenses=this.service.getentries();
console.log(this.personalData);
console.log(this.expenses);
  }
  
  printPage() {
    window.print(); 
  }
CalculateTotal(): number {
    return this.expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  }
  submitToMain() {
    const expenseData = {
    type: 'Expense',
    createdDate: new Date().toISOString(),
    purposePlace: this.personalData?.purposePlace || '',
    totalAmount: this.CalculateTotal().toFixed(2),
    status: 'Pending'
  };
    this.service.setExpense(expenseData);
  this.router.navigate(['']); // Navigate back to main page
}
cancelPage() {
  this.router.navigate(['']); 
}
}

       