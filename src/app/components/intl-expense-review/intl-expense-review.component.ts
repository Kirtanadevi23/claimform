import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { ClaimService } from '../../services/claim.service';
import { CardcashService } from '../../services/cardcash.service';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../shared/toast.service';
import { TempDataService } from '../../services/temp-data.service';
import { EmployeeService } from '../../services/employee.service';


@Component({
  selector: 'app-intl-expense-review',
  standalone: true,
  imports: [ClarityModule, CommonModule],
  templateUrl: './intl-expense-review.component.html',
  styleUrl: './intl-expense-review.component.css'
})
export class IntlExpenseReviewComponent implements OnInit {
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


  constructor(
    private expenseService: ExpenseService,
    private claimService: ClaimService,
    private cardCashService: CardcashService,
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

    /** STEP 4: Load Advance (Card + Cash) */
    this.cardCashService.getByClaimId(this.claimId).subscribe({
      next: (res) => {
        this.advance = res.reduce((sum: number, item: any) => {
          const totalInr = item.totalInr != null ? item.totalInr : ((item.inrRate || 0) * (item.totalLoaded || 0));
          return sum + totalInr;
        }, 0);
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
        // Store claim specific details
        this.tempDataService.claimDetails = {
          purposePlace: fullClaim.purpose || fullClaim.Purpose,
          companyPlant: fullClaim.companyPlant || fullClaim.CompanyPlant
        };
        this.populatePersonalData(this.tempDataService.employeeData, this.tempDataService.claimDetails);
      }
    });
  }

  /** Remove time from date */
  private populatePersonalData(empData: any, claimObj: any) {
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

  /** Group totals */
  getTotalByMode(mode: string): number {
    return this.expenses
      .filter((e: any) => e.paymentMode === mode)
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
  }

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
    const claimId = this.tempDataService.claimId;
    if (!claimId) {
      alert("No claim found");
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
      this.router.navigate(['/intl-expense-entry', this.tempDataService.claimId]);
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

  printPage() {
    window.print();
  }
}