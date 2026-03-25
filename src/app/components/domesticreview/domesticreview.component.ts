import { Component } from '@angular/core';
import { PersonalserviceService } from '../../services/personalservice.service';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-domesticreview',
  standalone: true,
  imports: [FormsModule, ClarityModule, CommonModule],
  templateUrl: './domesticreview.component.html',
  styleUrl: './domesticreview.component.css'
})
export class DomesticreviewComponent {
  expenses: any[] = [];
  personalData: any;
  advance: number = 0;
  constructor(private service: PersonalserviceService, private router: Router) { }
  ngOnInit(): void {
    this.personalData = this.service.getDetails();
    this.expenses = this.service.getentries();
    this.advance=this.service.getTotalAllowance();
    console.log(this.personalData);
    console.log(this.expenses);
  }

  printPage() {
    window.print();
  }
  CalculateTotal(): number {
    return this.expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  }

  get totalAmounts(): number {
  return this.expenses.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
 
}
 
getTotalByMode(mode: string): number {
  const totals = this.getTotalsByPaymentMode();
  const found = totals.find(t => t.mode === mode);
  return found ? found.total : 0;
}
 
 
getSettlementDetails(): { message: string, amount: number, type: 'recover' | 'pay' | 'none' } {
  const cashPaid = this.getTotalByMode('Cash');
  const difference =  cashPaid -this.advance ;
 
  if (difference < 0) {
    return { message: 'Amount Recover from Employee', amount: Math.abs(difference), type: 'recover' };
  } else if (difference > 0) {
    return { message: 'Amount Payable to Employee', amount: Math.abs(difference), type: 'pay' };
  } else {
    return { message: '', amount: 0, type: 'none' };
  }
}
 
getTotalsByPaymentMode(): { mode: string; total: number }[] {
  const totals: { [key: string]: number } = {};
 
  this.expenses.forEach(entry => {
    const mode = entry.mode;
    const amount = Number(entry.amount);
 
    if (!totals[mode]) {
      totals[mode] = 0;
    }
 
    totals[mode] += amount;
  });
 
  return Object.keys(totals).map(mode => ({
    mode,
    total: totals[mode]
  }));
 
 
}
 
  submitToMain() {
    const expenseData = {
      type: 'Domestic',
      createdDate: new Date().toLocaleString(),
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
