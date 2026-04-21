import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../services/expense.service'; // ✅ API
import { ClaimService } from '../../services/claim.service';     // ✅ API
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../shared/toast.service';
import { TempDataService } from '../../services/temp-data.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-general-expense-review',
  standalone: true,
  imports: [ClarityModule, CommonModule],
  templateUrl: './general-expense-review.component.html',
  styleUrl: './general-expense-review.component.css'
})
export class GeneralExpenseReviewComponent implements OnInit {
  expenses: any[] = [];
  claimData: any = {
    name: '',
    employeeCode: '',
    costCenter: '',
    vendorCode: '',
    companyPlant: '',
    purposePlace: ''
  };
  claimId: string | null = null;
  advance: number = 0;
  //  Typically 0 for General expense

  constructor(
    private expenseService: ExpenseService,
    private claimService: ClaimService,
    private router: Router,
    private toastService: ToastService,
    public tempDataService: TempDataService,
    private employeeService: EmployeeService,
    private route: ActivatedRoute
  ) { }
  ngOnInit(): void {
    // ✅ STEP 0: Recover claimId from URL
    const routeClaimId = this.route.snapshot.paramMap.get('claimId');
    if (routeClaimId) {
      this.tempDataService.claimId = routeClaimId;
    }

    // ✅ STEP 1: Get claimId from Service
    this.claimId = this.tempDataService.claimId;

    if (!this.claimId) {
      this.toastService.show("No claim session found", "danger");
      this.router.navigate(['/home-page']);
      return;
    }

    // Load basic info for the claim (Employee, Purpose, etc.)
    this.loadClaimData();

    // ✅ STEP 2: Load Expenses
    this.expenseService.getExpensesByClaimId(this.claimId).subscribe({
      next: (res) => {
        this.expenses = res;
      },
      error: (err) => {
        console.error("Expense fetch error:", err);
      }
    });
  }

  /**
   * Summary: Fetches employee and claim data from the backend.
   */
  loadClaimData() {
    this.claimService.getClaimById(this.claimId!).subscribe({
      next: (fullClaim: any) => {
        // Mapping directly from fullClaim with case-insensitive checks
        this.tempDataService.employeeData = {
          employeeName: fullClaim.employeeName || fullClaim.EmployeeName,
          employeeCode: fullClaim.employeeCode || fullClaim.EmployeeCode,
          costCentre: fullClaim.costCentre || fullClaim.CostCentre,
          vendorCode: fullClaim.vendorCode || fullClaim.VendorCode,
          companyPlant: fullClaim.companyPlant || fullClaim.CompanyPlant
        };
        // Store claim details
        this.tempDataService.claimDetails = {
          purposePlace: fullClaim.purpose || fullClaim.Purpose,
          companyPlant: fullClaim.companyPlant || fullClaim.CompanyPlant
        };
        this.populateClaimData(this.tempDataService.employeeData, this.tempDataService.claimDetails);
      }
    });
  }

  // ✅ Print
  printPage() {
    window.print();
  }

  /** Remove time from date */
  private populateClaimData(empData: any, claimObj: any) {
    if (empData) {
      this.claimData = {
        name: empData.employeeName || empData.name || '',
        employeeCode: empData.employeeCode || '',
        costCenter: empData.costCentre || '',
        vendorCode: empData.vendorCode || '',
        companyPlant: claimObj.companyPlant || '',
        purposePlace: claimObj.purposePlace || ''
      };
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    return date.split('T')[0];
  }

  /** Total Expense */
  get totalAmount(): number {
    return this.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
  }

  /** Group totals by payment mode */
  getTotalsByPaymentMode(): { mode: string; total: number }[] {
    const totals: { [key: string]: number } = {};
    this.expenses.forEach((entry: any) => {
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

  /** Group totals */
  getTotalByMode(mode: string): number {
    return this.expenses
      .filter((e: any) => e.paymentMode === mode)
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
  }

  /** Employee Paid = Cash */
  get employeePaid(): number {
    return this.getTotalByMode('Cash');
  }

  /** Company Paid = Card + Online */
  get companyPaid(): number {
    return this.getTotalByMode('Card') + this.getTotalByMode('Online') + this.getTotalByMode('Itilite');
  }

  /** Settlement Calculation */
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
    const claimId = this.tempDataService.claimId;
    if (!claimId) {
      alert("No claim session found");
      return;
    }
    const currentUser = this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System';

    this.claimService.submitClaim(claimId, currentUser).subscribe({
      next: () => {
        this.tempDataService.clearState(); // Cleanup
        this.router.navigate(['/home-page'], { queryParams: { submitted: 'true' } });
      },
      error: (err) => {
        this.toastService.show('Backend error', 'danger');
        console.error(err);
      }
    });
  }

  goBack() {
    if (this.tempDataService.isViewMode) {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/general-expense-entry', this.tempDataService.claimId]);
    }
  }

  onClose() {
    this.router.navigate(['/home-page']);
  }

  showCancelModal = false;

  cancelPage() {
    this.showCancelModal = true;
  }

  confirmCancel() {
    this.showCancelModal = false;
    this.router.navigate(['/home-page']);
  }
}