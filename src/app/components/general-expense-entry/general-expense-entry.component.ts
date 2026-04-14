import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
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
    private router: Router
  ) { }
  expenseForm!: FormGroup;
  expenses: any[] = [];
  personalData: any = {};
  showModal = false;
  today = new Date().toISOString().split('T')[0];
  claimId: string | null = null;
  // 🔥 NEW
  isEditMode = false;
  editExpenseId: string | null = null;

  // 🗑️ DELETE CONFIRMATION
  showDeleteModal = false;
  idToDelete: string = '';
  ngOnInit(): void {
    this.claimId = localStorage.getItem('claimId');
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
    this.expenseForm.reset();
    this.isEditMode = false;
    this.editExpenseId = null;
  }
  // 🔥 ADD + UPDATE
  addExpense() {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }
    const payload = {
      claimId: this.claimId,
      ...this.expenseForm.value
    };
    // ✅ EDIT
    if (this.isEditMode && this.editExpenseId) {
      this.expenseService.updateExpense(this.editExpenseId, payload)
        .subscribe({
          next: () => {
            this.loadExpenses();
            this.closeModal();
          }
        });
    }
    // ✅ ADD
    else {
      this.expenseService.addExpense(payload)
        .subscribe({
          next: () => {
            this.loadExpenses();
            this.closeModal();
          }
        });
    }
  }
  // 🔥 EDIT BUTTON
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
  // 🔥 DELETE BUTTON
  deleteExpense(id: string) {
    this.idToDelete = id;
    this.showDeleteModal = true;
  }

  confirmDeleteExpense() {
    if (this.idToDelete) {
      this.expenseService.deleteExpense(this.idToDelete).subscribe({
        next: () => {
          this.loadExpenses();
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error(err);
          alert("Error deleting expense");
          this.closeDeleteModal();
        }
      });
    }
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.idToDelete = '';
  }
  goBack() {
    this.router.navigate(['/home-page']);
  }
  review() {
    this.router.navigate(['/general-expense-review']);
  }
  cancel() {
    this.expenses = [];
  }
}