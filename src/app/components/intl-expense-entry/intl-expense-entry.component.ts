import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { ToastService } from '../../shared/toast.service';

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
    private toastService: ToastService
  ) { }

  expenseForm!: FormGroup;
  expenses: any[] = [];
  personalData: any = {};
  showModal = false;
  today: string = new Date().toISOString().split('T')[0];
  claimId: string | null = null;
  isEditMode = false;
  editExpenseId: string | null = null;

  // 🗑️ DELETE CONFIRMATION
  showDeleteModal = false;
  idToDelete: string = '';

  // Accordion toggles
  showPersonal: boolean = true;
  showExpenses = true;

  ngOnInit(): void {
    // get claimId from previous page
    this.claimId = localStorage.getItem('claimId');

    // GET EMPLOYEE DATA
    const emp = localStorage.getItem('employeeData');
    const claim = localStorage.getItem('claimDetails');
    if (emp && claim) {
      const empData = JSON.parse(emp);
      const claimData = JSON.parse(claim);
      this.personalData = {
        name: empData.name,
        employeeCode: empData.employeeCode,
        costCenter: empData.costCentre,
        vendorCode: empData.vendorCode,
        companyPlant: claimData.companyPlant,
        purposePlace: claimData.purposePlace
      };
    }

    // create reactive form
    this.expenseForm = this.fb.group({
      date: ['', Validators.required],
      supportingNo: ['', Validators.required],
      particulars: ['', Validators.required],
      paymentMode: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      remarks: ['']
    });

    if (this.claimId) {
      this.loadExpenses();
    }
  }

  loadExpenses() {
    this.expenseService.getExpensesByClaimId(this.claimId!)
      .subscribe({
        next: (data: any) => {
          this.expenses = data;
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
  }

  addExpense() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const payload = {
      claimId: this.claimId,
      ...this.expenseForm.value
    };

    if (this.isEditMode && this.editExpenseId) {
      this.expenseService.updateExpense(this.editExpenseId, payload).subscribe({
        next: () => {
          this.toastService.show('Expense updated', 'success');
          this.loadExpenses();
          this.closeModal();
        },
        error: (err) => {
          this.toastService.show('API failure', 'danger');
          console.error(err);
        }
      });
    } else {
      this.expenseService.addExpense(payload).subscribe({
        next: () => {
          this.toastService.show('Expense added', 'success');
          this.loadExpenses();
          this.closeModal();
        },
        error: (err) => {
          this.toastService.show('API failure', 'danger');
          console.error(err);
        }
      });
    }
  }

  editExpense(e: any) {
    this.isEditMode = true;
    this.editExpenseId = e.expenseId;
    this.expenseForm.patchValue({
      date: e.date,
      supportingNo: e.supportingNo,
      particulars: e.particulars,
      paymentMode: e.paymentMode,
      amount: e.amount,
      remarks: e.remarks
    });
    this.showModal = true;
  }

  deleteExpense(id: string) {
    this.idToDelete = id;
    this.showDeleteModal = true;
  }

  confirmDeleteExpense() {
    if (this.idToDelete) {
      this.expenseService.deleteExpense(this.idToDelete).subscribe({
        next: () => {
          this.toastService.show('Expense deleted', 'success');
          this.loadExpenses();
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toastService.show('Backend error', 'danger');
          console.error(err);
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.idToDelete = '';
  }

  review() {
    this.router.navigate(['/intl-expense-review']);
  }

  cancel() {
    if (confirm('Clear all entries?')) {
      this.expenses = [];
    }
  }

  goBack(): void {
    this.router.navigate(['/intl-travel-details']);
  }
}
