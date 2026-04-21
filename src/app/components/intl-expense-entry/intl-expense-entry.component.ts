import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { ToastService } from '../../shared/toast.service';
import { TempDataService } from '../../services/temp-data.service';
import { CardcashService } from '../../services/cardcash.service';
import { EmployeeService } from '../../services/employee.service';
import { ClaimService } from '../../services/claim.service';
import { forkJoin } from 'rxjs';


import '@cds/core/icon/register.js';
import { ClarityIcons, trashIcon, eyeIcon } from '@cds/core/icon';

ClarityIcons.addIcons(trashIcon, eyeIcon);

@Component({
  selector: 'app-intl-expense-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClarityModule],
  templateUrl: './intl-expense-entry.component.html',
  styleUrl: './intl-expense-entry.component.css'
})
export class IntlExpenseEntryComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private router: Router,
    private toastService: ToastService,
    public tempDataService: TempDataService,
    private cardcashService: CardcashService,
    private employeeService: EmployeeService,
    private claimService: ClaimService,
    private route: ActivatedRoute
  ) { }

  expenseForm!: FormGroup;
  get expenses() { return this.tempDataService.intlExpenseEntries; }
  set expenses(val: any[]) { this.tempDataService.intlExpenseEntries = val; }
  personalData: any = {
    name: '',
    employeeCode: '',
    costCenter: '',
    vendorCode: '',
    companyPlant: '',
    purposePlace: ''
  };
  showModal = false;
  today: string = new Date().toISOString().split('T')[0];
  get maxExpenseDate(): string {
    const travelEnd = this.tempDataService.intlTravelDetails?.travelEnd;
    return travelEnd ? travelEnd.split('T')[0] : this.today;
  }
  claimId: string | null = null;
  isEditMode = false;
  editExpenseId: string | null = null;

  // Currency details for conversion
  currencyType: string = 'INR';
  inrRate: number = 1.0;

  // Date range validation
  minDate: string = '';
  maxDate: string = '';

  // 🗑️ DELETE CONFIRMATION
  showDeleteModal = false;
  idToDelete: string = '';

  // Accordion toggles
  showPersonal: boolean = true;
  showExpenses = true;

  // Screenshot Upload State
  selectedFileName: string | null = null;
  selectedFileBase64: string | null = null;

  // Image Preview Modal
  previewImageBase64: string | null = null;
  showImagePreview = false;

  ngOnInit(): void {
    // 0. Recover claimId from URL
    const routeClaimId = this.route.snapshot.paramMap.get('claimId');
    if (routeClaimId) {
      this.tempDataService.claimId = routeClaimId;
    }

    // get claimId from Service
    this.claimId = this.tempDataService.claimId;

    // Load basic info for the claim (Employee, Purpose, etc.)
    if (this.claimId) {
      this.loadClaimData();
    }

    // create reactive form
    this.expenseForm = this.fb.group({
      date: ['', Validators.required],
      supportingNo: ['', Validators.required],
      particulars: ['', Validators.required],
      paymentMode: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      screenshot: ['', Validators.required],
      remarks: ['']
    });

    if (this.claimId && this.expenses.length === 0) {
      this.loadExpenses();
    }

    // Set Date Boundaries
    const travel = this.tempDataService.intlTravelDetails;
    if (travel.travelStart && travel.travelEnd) {
      this.minDate = travel.travelStart.split('T')[0];
      this.maxDate = travel.travelEnd.split('T')[0];
    }
  }

  /**
   * Summary: Fetches employee info and travel details (like currency and exchange rate) from the backend.
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
        this.tempDataService.claimDetails = {
          purposePlace: fullClaim.purpose || fullClaim.Purpose,
          companyPlant: fullClaim.companyPlant || fullClaim.CompanyPlant
        };
        this.populatePersonalData(this.tempDataService.employeeData, this.tempDataService.claimDetails);

        // Fetch Card/Cash entries to get the exchange rate (inrRate)
        this.cardcashService.getByClaimId(this.claimId!).subscribe(entries => {
          if (entries && entries.length > 0) {
            const first = entries[0];
            this.currencyType = first.currencyType || 'INR';
            this.inrRate = first.inrRate || 1.0;

            // Sync with global state
            this.tempDataService.intlTravelDetails = {
              selectedCurrency: this.currencyType,
              inrRate: this.inrRate,
              travelStart: first.startDate || '',
              travelEnd: first.endDate || '',
              numberOfDays: this.calculateDays(first.startDate, first.endDate)
            };
          }
        });
      }
    });
  }

  calculateDays(startVal: string, endVal: string): number {
    if (startVal && endVal) {
      const start = new Date(startVal).getTime();
      const end = new Date(endVal).getTime();
      const diff = (end - start) / (1000 * 60 * 60 * 24);
      return parseFloat(diff.toFixed(2));
    }
    return 0;
  }


  loadExpenses() {
    this.expenseService.getExpensesByClaimId(this.claimId!)
      .subscribe({
        next: (data: any[]) => {
          this.expenses = data.map(e => ({
            ...e,
            expenseId: e.expenseId || e.ExpenseId,
            date: e.date || e.Date,
            supportingNo: e.supportingNo || e.SupportingNo,
            particulars: e.particulars || e.Particulars,
            paymentMode: e.paymentMode || e.PaymentMode,
            amount: e.amount || e.Amount,
            remarks: e.remarks || e.Remarks,
            screenshotBase64: e.screenshotBase64 || e.ScreenshotBase64,
            screenshotName: e.screenshotName || e.ScreenshotName || (e.screenshotBase64 || e.ScreenshotBase64 ? 'File_Attached' : null)
          }));
        },
        error: (err) => console.error(err)
      });
  }

  openModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.expenseForm.reset();
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.editExpenseId = null;
    this.expenseForm.reset();
    this.clearFile();
    // Reset file input manually if needed
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onModalOpenChange(open: boolean) {
    if (!open) {
      this.closeModal();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        this.toastService.show('Only JPG and PNG files are allowed', 'danger');
        return;
      }
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileBase64 = e.target.result.split(',')[1];
        this.expenseForm.patchValue({ screenshot: this.selectedFileBase64 });
      };
      reader.readAsDataURL(file);
    }
  }

  clearFile(inputEl?: HTMLInputElement) {
    this.selectedFileName = null;
    this.selectedFileBase64 = null;
    this.expenseForm.patchValue({ screenshot: '' });
    if (inputEl) {
      inputEl.value = '';
    }
  }

  viewImage(base64: string) {
    this.previewImageBase64 = base64;
    this.showImagePreview = true;
  }

  closeImagePreview() {
    this.showImagePreview = false;
    this.previewImageBase64 = null;
  }

  /**
   * Summary: Converts the foreign amount to INR and adds it to the list.
   */
  addExpense() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const value = this.expenseForm.value;

    if (this.isEditMode && this.editExpenseId) {
      // Update existing item locally
      const index = this.expenses.findIndex(e => e.expenseId === this.editExpenseId || e.tempId === this.editExpenseId);
      if (index !== -1) {
        this.expenses[index] = {
          ...this.expenses[index],
          ...value,
          screenshotBase64: this.selectedFileBase64,
          screenshotName: this.selectedFileName
        };

        if (this.expenses[index].expenseId) {
          this.expenses[index].isUpdated = true;
        }

        this.toastService.show('Expense updated', 'info');
      }
      this.closeModal();
    } else {
      // Add new item locally
      const newExpense = {
        ...value,
        screenshotBase64: this.selectedFileBase64,
        screenshotName: this.selectedFileName,
        tempId: Date.now().toString(),
        isNew: true,
        currentUser: this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.name || 'System'
      };
      this.expenses.push(newExpense);
      this.toastService.show('Expense added', 'info');
      this.closeModal();
    }
  }

  /**
   * Summary: Prepares an expense for editing by converting stored INR back to foreign currency.
   */
  editExpense(e: any) {
    this.isEditMode = true;
    this.editExpenseId = e.expenseId || e.tempId;

    this.expenseForm.patchValue({
      date: e.date ? e.date.split('T')[0] : '',
      supportingNo: e.supportingNo,
      particulars: e.particulars,
      paymentMode: e.paymentMode,
      amount: e.amount,
      remarks: e.remarks,
      screenshot: e.screenshotBase64 || ''
    });
    this.selectedFileBase64 = e.screenshotBase64 || e.ScreenshotBase64 || null;
    this.selectedFileName = e.screenshotName || e.ScreenshotName || (e.screenshotBase64 || e.ScreenshotBase64 ? 'File_Attached' : null);
    this.showModal = true;
  }

  deleteExpense(id: string) {
    this.idToDelete = id;
    this.showDeleteModal = true;
  }

  confirmDeleteExpense() {
    if (this.idToDelete) {
      const item = this.expenses.find(e => (e.expenseId === this.idToDelete || e.tempId === this.idToDelete));

      // IF item exists in DB, DELETE FROM API IMMEDIATELY
      if (item && item.expenseId) {
        this.toastService.show('Deleting from server...', 'info');
        const currentUser = this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System';
        this.expenseService.deleteExpense(item.expenseId, currentUser).subscribe({
          next: () => {
            this.expenses = this.expenses.filter(e => e.expenseId !== this.idToDelete);
            this.toastService.show('Expense deleted successfully', 'success');
            this.closeDeleteModal();
          },
          error: (err) => {
            this.toastService.show('Failed to delete from server', 'danger');
            console.error(err);
          }
        });
      } else {
        // Remove locally only
        this.expenses = this.expenses.filter(e => e.tempId !== this.idToDelete);
        this.toastService.show('Expense removed', 'info');
        this.closeDeleteModal();
      }
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.idToDelete = '';
  }

  goBack() {
    if (this.tempDataService.isViewMode) {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/intl-travel-details', this.tempDataService.claimId]);
    }
  }

  onClose() {
    this.router.navigate(['/home-page']);
  }

  cancelEdit() {
    this.router.navigate(['/home-page']);
  }

  review() {
    const claimId = this.tempDataService.claimId;
    if (!claimId) return;

    const newExpenses = this.expenses.filter(e => e.isNew);
    const updatedExpenses = this.expenses.filter(e => e.isUpdated);
    const idsToDelete = this.tempDataService.intlExpenseDeletes;

    if (newExpenses.length === 0 && updatedExpenses.length === 0 && idsToDelete.length === 0) {
      this.router.navigate(['/intl-expense-review', claimId]);
      return;
    }

    this.toastService.show('Syncing expenses...', 'info');

    const requests: any[] = [];

    // 1. ADD NEW
    newExpenses.forEach(e => {
      requests.push(this.expenseService.addExpense({
        claimId,
        date: e.date,
        supportingNo: e.supportingNo,
        particulars: e.particulars,
        paymentMode: e.paymentMode,
        amount: e.amount,
        remarks: e.remarks,
        screenshotBase64: e.screenshotBase64 || e.ScreenshotBase64,
        screenshotName: e.screenshotName || e.ScreenshotName,
        currentUser: this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System'
      }));
    });

    // 2. UPDATE EXISTING
    updatedExpenses.forEach(e => {
      requests.push(this.expenseService.updateExpense(e.expenseId, {
        expenseId: e.expenseId,
        claimId,
        date: e.date,
        supportingNo: e.supportingNo,
        particulars: e.particulars,
        paymentMode: e.paymentMode,
        amount: e.amount,
        remarks: e.remarks,
        screenshotBase64: e.screenshotBase64 || e.ScreenshotBase64,
        screenshotName: e.screenshotName || e.ScreenshotName,
        currentUser: this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System'
      }));
    });

    // 3. DELETE REMOVED - Safety only
    idsToDelete.forEach(id => {
      const currentUser = this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System';
      requests.push(this.expenseService.deleteExpense(id, currentUser));
    });

    forkJoin(requests).subscribe({
      next: () => {
        // Clear local state
        this.expenses = [];
        this.tempDataService.intlExpenseDeletes = [];

        const msg = (newExpenses.length > 0 && updatedExpenses.length > 0) ? 'Expenses processed successfully' :
          (updatedExpenses.length > 0) ? 'Expenses updated successfully' : 'Expenses created successfully';
        this.toastService.show(msg, 'success');
        this.router.navigate(['/intl-expense-review', claimId]);
      },
      error: (err) => {
        this.toastService.show('Sync failed', 'danger');
        console.error(err);
      }
    });
  }

  cancel() {
    if (confirm('Clear all entries?')) {
      this.expenses = [];
    }
  }


  private populatePersonalData(empData: any, claimData: any) {
    if (empData) {
      this.personalData = {
        name: empData.employeeName || empData.name || '',
        employeeCode: empData.employeeCode || '',
        costCenter: empData.costCentre || '',
        vendorCode: empData.vendorCode || '',
        companyPlant: claimData.companyPlant || '',
        purposePlace: claimData.purposePlace || ''
      };
    }
  }
}
