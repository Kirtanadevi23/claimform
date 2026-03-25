import { Component } from '@angular/core';
import { PersonalserviceService } from '../../services/personalservice.service';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-internationalreview',
  standalone: true,
  imports: [FormsModule, ClarityModule, CommonModule],
  templateUrl: './internationalreview.component.html',
  styleUrl: './internationalreview.component.css'
})
export class InternationalreviewComponent {

  expenses: any[] = [];
  personalData: any;
  advance: number = 0;
  constructor(private service: PersonalserviceService, private router: Router) { }
  ngOnInit(): void {
      debugger;
    this.personalData = this.service.getDetails();
    this.expenses = this.service.getentries();
    console.log(this.personalData);
    console.log(this.expenses);
    this.advance=this.service.getTotalAllowance();
  }

  printPage() {
    window.print();
  }
  CalculateTotal(): number {
    return this.expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  }

  get totalAmounts(): number {
    return this.expenses.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  }

  getTotalsByPaymentMode(): { mode: string; total: number }[] {
   
   debugger;
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

  getTotalByMode(mode: string): number {
    const totals =this.getTotalsByPaymentMode();
    const found = totals.find(t => t.mode === mode);
    return found ? found.total : 0;
  }


  getSettlementDetails(): { message: string, amount: number, type: 'recover' | 'pay' | 'none' } {
    const cashPaid = this.getTotalByMode('Cash');
    const difference = cashPaid - this.advance;

    if (difference < 0) {
      return { message: 'Amount Recover from Employee', amount: Math.abs(difference), type: 'recover' };
    } else if (difference > 0) {
      return { message: 'Amount Payable to Employee', amount: Math.abs(difference), type: 'pay' };
    } else {
      return { message: '', amount: 0, type: 'none' };
    }
  }


  submitToMain() {
    const expenseData = {
      type: 'International',
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
