import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { EmployeeService } from '../../services/employee.service';
import { ToastService } from '../../shared/toast.service';

import { TempDataService } from '../../services/temp-data.service';
import { ClaimService } from '../../services/claim.service';
import { forkJoin } from 'rxjs';
import '@cds/core/icon/register.js';
import { ClarityIcons, trashIcon, eyeIcon } from '@cds/core/icon';

ClarityIcons.addIcons(trashIcon, eyeIcon);
@Component({
  selector: 'app-general-expense-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClarityModule],
  templateUrl: './general-expense-entry.component.html',
  styleUrls: ['./general-expense-entry.component.css']
})
export class GeneralExpenseEntryComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private router: Router,
    private toastService: ToastService,
    public tempDataService: TempDataService,
    private employeeService: EmployeeService,
    private claimService: ClaimService,
    private route: ActivatedRoute
  ) { }
  expenseForm!: FormGroup;
  get expenses() { return this.tempDataService.generalExpenseEntries; }
  set expenses(val: any[]) { this.tempDataService.generalExpenseEntries = val; }
  personalData: any = {
    name: '',
    employeeCode: '',
    costCenter: '',
    vendorCode: '',
    companyPlant: '',
    purposePlace: ''
  };
  showModal = false;
  today = new Date().toISOString().split('T')[0];
  claimId: string | null = null;
  // 🔥 NEW
  isEditMode = false;
  editExpenseId: string | null = null;

  // 🗑️ DELETE CONFIRMATION
  showDeleteModal = false;
  idToDelete: string = '';

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

    this.claimId = this.tempDataService.claimId;

    // Load basic info for the claim (Employee name, cost center, etc.)
    if (this.claimId) {
      this.loadClaimData();
    }

    this.expenseForm = this.fb.group({
      date: ['', Validators.required],
      supportingNo: ['', Validators.required],
      particulars: ['', Validators.required],
      paymentMode: ['Cash', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      screenshot: ['', Validators.required],
      remarks: ['']
    });

    if (this.claimId && this.expenses.length === 0) {
      this.loadExpenses();
    }
  }

  /**
   * Summary: Fetches employee and claim info from the database.
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
      }
    });
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
    this.expenseForm.reset({ paymentMode: 'Cash' });
  }
  closeModal() {
    this.showModal = false;
    this.expenseForm.reset({ paymentMode: 'Cash' });
    this.isEditMode = false;
    this.editExpenseId = null;
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
  // 🔥 ADD + UPDATE
  addExpense() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const value = this.expenseForm.value;

    if (this.isEditMode && this.editExpenseId) {
      const index = this.expenses.findIndex(e => e.expenseId === this.editExpenseId || e.tempId === this.editExpenseId);
      if (index !== -1) {
        this.expenses[index] = {
          ...this.expenses[index],
          ...value,
          screenshotBase64: this.selectedFileBase64,
          screenshotName: this.selectedFileName
        };

        // If existing item, mark for update
        if (this.expenses[index].expenseId) {
          this.expenses[index].isUpdated = true;
        }

        this.toastService.show('Expense updated', 'info');
      }
      this.closeModal();
    } else {
      const newExpense = {
        ...value,
        screenshotBase64: this.selectedFileBase64,
        screenshotName: this.selectedFileName,
        tempId: Date.now().toString(),
        isNew: true,
        currentUser: this.tempDataService.employeeData?.employeeName || 'System'
      };
      this.expenses.push(newExpense);
      this.toastService.show('Expense added', 'info');
      this.closeModal();
    }
  }
  // 🔥 EDIT BUTTON
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
  // 🔥 DELETE BUTTON
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
      this.router.navigate(['/home-page']);
    }
  }

  onClose(): void {
    this.router.navigate(['/home-page']);
  }

  cancelEdit(): void {
    this.router.navigate(['/home-page']);
  }
  review() {
    const claimId = this.tempDataService.claimId;
    if (!claimId) return;

    const newExpenses = this.expenses.filter(e => e.isNew);
    const updatedExpenses = this.expenses.filter(e => e.isUpdated);
    const idsToDelete = this.tempDataService.generalExpenseDeletes;

    if (newExpenses.length === 0 && updatedExpenses.length === 0 && idsToDelete.length === 0) {
      this.router.navigate(['/general-expense-review', claimId]);
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

    // 3. DELETE REMOVED
    idsToDelete.forEach(id => {
      const currentUser = this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System';
      requests.push(this.expenseService.deleteExpense(id, currentUser));
    });

    forkJoin(requests).subscribe({
      next: () => {
        // Clear local state
        this.expenses = [];
        this.tempDataService.generalExpenseDeletes = [];

        const msg = (newExpenses.length > 0 && updatedExpenses.length > 0) ? 'Expenses processed successfully' :
          (updatedExpenses.length > 0) ? 'Expenses updated successfully' : 'Expenses created successfully';
        this.toastService.show(msg, 'success');
        this.router.navigate(['/general-expense-review', claimId]);
      },
      error: (err) => {
        this.toastService.show('Sync failed', 'danger');
        console.error(err);
      }
    });
  }
  cancel() {
    this.expenses = [];
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