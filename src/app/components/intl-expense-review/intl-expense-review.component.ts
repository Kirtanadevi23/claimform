import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { ClaimService } from '../../services/claim.service';
import { CardcashService } from '../../services/cardcash.service';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-intl-expense-review',
  standalone: true,
  imports: [ClarityModule, CommonModule],
  templateUrl: './intl-expense-review.component.html',
  styleUrl: './intl-expense-review.component.css'
})
export class IntlExpenseReviewComponent implements OnInit {
  expenses: any[] = [];
  claimData: any = {};
  claimId: string | null = null;
  advance: number = 0;

  constructor(
    private expenseService: ExpenseService,
    private claimService: ClaimService,
    private cardCashService: CardcashService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    /** STEP 1: Get claimId */
    this.claimId = localStorage.getItem('claimId');
    if (!this.claimId) {
      alert("No claim found");
      this.router.navigate(['/home-page']);
      return;
    }

    // ✅ STEP 2: Load Expenses
    this.expenseService.getExpensesByClaimId(this.claimId).subscribe({
      next: (res) => {
        console.log("EXPENSES FROM API:", res);
        this.expenses = res;
      },
      error: (err) => {
        console.error("Expense fetch error:", err);
      }
    });
    // ✅ STEP 3: Load Personal Details strictly from localStorage (as in expense)
    const empLocalStr = localStorage.getItem('employeeData');
    const claimLocalStr = localStorage.getItem('claimDetails');
    if (empLocalStr && claimLocalStr) {
      const empData = JSON.parse(empLocalStr);
      const claimObj = JSON.parse(claimLocalStr);
      this.claimData = {
        name: empData.name,
        employeeCode: empData.employeeCode,
        costCenter: empData.costCentre,
        vendorCode: empData.vendorCode,
        companyPlant: claimObj.companyPlant,
        purposePlace: claimObj.purposePlace
      };
    }

    /** STEP 4: Load Advance (Card + Cash) */
    this.cardCashService.getByClaimId(this.claimId).subscribe({
      next: (res) => {
        console.log("CardCash:", res);
        this.advance = res.reduce((sum: number, item: any) => {
          const totalInr = item.totalInr != null ? item.totalInr : ((item.inrRate || 0) * (item.totalLoaded || 0));
          return sum + totalInr;
        }, 0);
      }
    });
  }

  /** Remove time from date */
  formatDate(date: string): string {
    if (!date) return '';
    return date.split('T')[0];
  }

  /** Total Expense */
  get totalAmount(): number {
    return this.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  /** Group totals */
  getTotalByMode(mode: string): number {
    return this.expenses
      .filter(e => e.paymentMode === mode)
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  getTotalsByPaymentMode(): { mode: string; total: number }[] {
    const totals: { [key: string]: number } = {};
    this.expenses.forEach(entry => {
      const mode = entry.paymentMode;
      const amount = Number(entry.amount || 0);
      if (!totals[mode]) totals[mode] = 0;
      totals[mode] += amount;
    });
    return Object.keys(totals).map(mode => ({
      mode,
      total: totals[mode]
    }));
  }

  /** Employee Paid = Cash */
  get employeePaid(): number {
    return this.getTotalByMode('Cash');
  }

  /** Company Paid = Card + Online */
  get companyPaid(): number {
    // If you guys use Online or Itilite, make sure both are captured or map correctly.
    return this.getTotalByMode('Card') + this.getTotalByMode('Online') + this.getTotalByMode('Itilite');
  }

  /** Settlement */
  get settlement() {
    const diff = this.advance - this.employeePaid;
    if (diff > 0) {
      return { msg: "Amount Recover from Employee", value: diff, color: 'red' };
    } else if (diff < 0) {
      return { msg: "Amount Payable to Employee", value: Math.abs(diff), color: 'green' };
    } else {
      return { msg: "Settled", value: 0, color: 'black' };
    }
  }

  /** Submit Claim */
  submitToMain() {
    if (!this.claimId) return;
    this.claimService.submitClaim(this.claimId).subscribe({
      next: () => {
        this.toastService.show('Claim submitted', 'success');
        localStorage.removeItem('claimId');
        this.router.navigate(['/home-page']);
      },
      error: (err) => {
        this.toastService.show('Backend error', 'danger');
        console.error(err);
      }
    });
  }

  cancelPage() {
    this.router.navigate(['/home-page']);
  }

  printPage() {
    window.print();
  }
}