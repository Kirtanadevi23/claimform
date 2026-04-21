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
  selector: 'app-domestic-expense-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClarityModule],
  templateUrl: './domestic-expense-entry.component.html',
  styleUrl: './domestic-expense-entry.component.css'
})
export class DomesticExpenseEntryComponent implements OnInit {
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
  get expenses() { return this.tempDataService.expenseEntries; }
  set expenses(val: any[]) { this.tempDataService.expenseEntries = val; }
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
    const travelEnd = this.tempDataService.domesticTravelDetails?.travelEnd;
    return travelEnd ? travelEnd.split('T')[0] : this.today;
  }
  claimId: string | null = null;
  isEditMode = false;
  editExpenseId: string | null = null;

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

    // Check if we already have expenses in service (from back navigation)
    // If empty, we could load from API once, but per requirements we focus on local state
    if (this.claimId && this.expenses.length === 0) {
      this.loadExpenses();
    }

    // Set Date Boundaries
    const travel = this.tempDataService.domesticTravelDetails;
    if (travel.travelStart && travel.travelEnd) {
      this.minDate = travel.travelStart.split('T')[0];
      this.maxDate = travel.travelEnd.split('T')[0];
    }
  }

  /**
   * Summary: Fetches employee info and claim details from the database.
   */
  loadClaimData() {
    this.claimService.getClaimById(this.claimId!).subscribe({
      next: (fullClaim: any) => {
        // Update employee info
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

        // Populate travel details if they exist in card cash for this claim
        if (!this.tempDataService.domesticTravelDetails.travelStart) {
          this.cardcashService.getByClaimId(this.claimId!).subscribe(entries => {
            if (entries.length > 0) {
              const first = entries[0];
              this.tempDataService.domesticTravelDetails = {
                selectedCurrency: first.currencyType || 'INR',
                travelStart: first.startDate || '',
                travelEnd: first.endDate || '',
                numberOfDays: this.calculateDays(first.startDate, first.endDate)
              };
            }
          });
        }
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
      inputEl.value = ''; // Reset input to allow re-selecting same file
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

  addExpense() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const value = this.expenseForm.value;

    if (this.isEditMode && this.editExpenseId) {
      // Find and update locally
      const index = this.expenses.findIndex(e => e.expenseId === this.editExpenseId || e.tempId === this.editExpenseId);
      if (index !== -1) {
        this.expenses[index] = {
          ...this.expenses[index],
          ...value,
          screenshotBase64: this.selectedFileBase64,
          screenshotName: this.selectedFileName
        };

        // If it was an existing item (has expenseId), mark for update
        if (this.expenses[index].expenseId) {
          this.expenses[index].isUpdated = true;
        }

        this.toastService.show('Expense updated', 'info');
      }
      this.closeModal();
    } else {
      // Add locally
      const newExpense = {
        ...value,
        screenshotBase64: this.selectedFileBase64,
        screenshotName: this.selectedFileName,
        tempId: Date.now().toString(), // Use tempId for local tracking
        isNew: true,
        currentUser: this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.name || 'System'
      };
      this.expenses.push(newExpense);
      this.toastService.show('Expense added', 'info');
      this.closeModal();
    }
  }

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

      // IF item exists in DB (has real expenseId), DELETE FROM API IMMEDIATELY
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
        // Remove locally only (unsaved item)
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
      this.router.navigate(['/domestic-travel-details', this.tempDataService.claimId]);
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
    const idsToDelete = this.tempDataService.domesticExpenseDeletes;

    if (newExpenses.length === 0 && updatedExpenses.length === 0 && idsToDelete.length === 0) {
      this.router.navigate(['/domestic-expense-review', claimId]);
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

    // 3. DELETE REMOVED - (No longer needed here as we delete immediately, but keeping for safety if array had leftovers)
    idsToDelete.forEach(id => {
      const currentUser = this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System';
      requests.push(this.expenseService.deleteExpense(id, currentUser));
    });

    forkJoin(requests).subscribe({
      next: () => {
        // Clear local state to force refresh from API with DB IDs
        this.expenses = [];
        this.tempDataService.domesticExpenseDeletes = [];

        const msg = (newExpenses.length > 0 && updatedExpenses.length > 0) ? 'Expenses processed successfully' :
          (updatedExpenses.length > 0) ? 'Expenses updated successfully' : 'Expenses created successfully';
        this.toastService.show(msg, 'success');
        this.router.navigate(['/domestic-expense-review', claimId]);
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
