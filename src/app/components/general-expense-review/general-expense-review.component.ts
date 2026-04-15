import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../services/expense.service'; // ✅ API
import { ClaimService } from '../../services/claim.service';     // ✅ API
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/toast.service';
@Component({
  selector: 'app-general-expense-review',
  standalone: true,
  imports: [ClarityModule, CommonModule],
  templateUrl: './general-expense-review.component.html',
  styleUrl: './general-expense-review.component.css'
})
export class GeneralExpenseReviewComponent implements OnInit {
  expenses: any[] = [];       //  table data
  claimData: any;             //  for top personal section
  claimId: string | null = null;
  constructor(
    private expenseService: ExpenseService,
    private claimService: ClaimService,
    private router: Router,
    private toastService: ToastService
  ) { }
  ngOnInit(): void {
    // ✅ STEP 1: Get claimId
    this.claimId = localStorage.getItem('claimId');
    if (!this.claimId) {
      alert("No claim found");
      this.router.navigate(['']);
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
  }
  // ✅ Print
  printPage() {
    window.print();
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

  /** Group totals by payment mode */
  getTotalsByPaymentMode(): { mode: string; total: number }[] {
    const totals: { [key: string]: number } = {};
    this.expenses.forEach(entry => {
      const mode = entry.paymentMode;
      const amount = Number(entry.amount || 0);
      if (!totals[mode]) totals[mode] = 0;
      totals[mode] += amount;
    });
    return Object.keys(totals)
      .filter(mode => mode !== 'Online')
      .map(mode => ({
        mode,
        total: totals[mode]
      }));
  }
  // ✅ Submit claim
  // submitToMain() {
  //   if (!this.claimId) return;
  //   this.claimService.submitClaim(this.claimId).subscribe({
  //     next: () => {
  //       //  alert("Claim submitted successfully");
  //       console.log("Claim submitted successfully");
  //       this.router.navigate(['/home']);
  //     },
  //     error: () => {
  //       alert("Submit failed");
  //     }
  //   });
  // }

  submitToMain() {
    const claimId = localStorage.getItem('claimId');
    if (!claimId) {
      alert("No claim found");
      return;
    }
    this.claimService.submitClaim(claimId).subscribe({
      next: () => {
        this.toastService.show('Claim submitted', 'success');
        console.log("Claim submitted successfully");
        this.router.navigate(['/home-page']);
      },
      error: (err) => {
        this.toastService.show('Backend error', 'danger');
        console.error(err);
      }
    });
  }
  // ✅ Cancel
  cancelPage() {
    this.router.navigate(['']);
  }
}