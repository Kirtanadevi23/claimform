import { Component, OnInit } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppHeaderComponent } from "../app-header/app-header.component";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClaimService } from '../../services/claim.service';
import { EmployeeService } from '../../services/employee.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClarityModule, AppHeaderComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  constructor(
    private router: Router,
    private claimService: ClaimService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private toastService: ToastService
  ) { }

  claims: any[] = [];
  claimForm!: FormGroup;
  modalOpen = false;
  selectedType = '';
  today = new Date().toISOString().split('T')[0];
  showAlert: boolean = false;
  // Store employee data here so we can re-populate after reset
  employeeData: any = null;

  ngOnInit(): void {
    // Build empty form first
    this.claimForm = this.fb.group({
      username: ['', Validators.required],
      employeeCode: ['', Validators.required],
      purposePlace: ['', Validators.required],
      companyPlant: ['', Validators.required],
      costCenter: ['', Validators.required],
      vendorCode: ['', Validators.required]
    });

    const employeeId = localStorage.getItem('employeeId');
    if (employeeId) {
      // Fetch employee from backend and save in employeeData variable
      this.employeeService.getEmployeeById(employeeId).subscribe({
        next: (emp: any) => {
          this.employeeData = emp; // save it here
          this.populateEmployeeFields(); // fill the form
        },
        error: (err: any) => console.error('Failed to load employee:', err)
      });
      // Fetch recent claims for the table
      this.claimService.getClaimsByEmployeeId(employeeId).subscribe({
        next: (data: any) => this.claims = data,
        error: (err: any) => console.error('Claims fetch error:', err)
      });

      this.router.events.subscribe(() => {
        if (employeeId) {
          this.claimService.getClaimsByEmployeeId(employeeId).subscribe({
            next: (data: any) => {
              this.claims = data;
            }
          });
        }
      });
    }
  }
  // Separate method to fill employee fields
  // We call this on load AND after modal reset
  populateEmployeeFields() {
    if (this.employeeData) {
      this.claimForm.patchValue({
        username: this.employeeData.name,
        employeeCode: this.employeeData.employeeCode,
        costCenter: this.employeeData.costCentre,
        vendorCode: this.employeeData.vendorCode,
        companyPlant: this.employeeData.companyPlant,
        // purposePlace — user fills this
      });
    }
  }

  openModal(type: string) {
    // Force close first — fixes Clarity reopen bug
    this.modalOpen = false;
    setTimeout(() => {
      this.selectedType = type;
      // Clear only purposePlace and companyPlant, keep employee data
      this.claimForm.patchValue({
        purposePlace: ''
      });
      // Re-populate employee fields so they are not empty
      this.populateEmployeeFields();
      this.modalOpen = true;
    }, 0);
  }

  closeModal() {
    this.modalOpen = false;
  }

  submitForm() {
    this.claimForm.markAllAsTouched();
    if (this.claimForm.invalid) {
      return;
    }
    localStorage.setItem('employeeData', JSON.stringify(this.employeeData));
    localStorage.setItem('claimDetails', JSON.stringify({
      purposePlace: this.claimForm.value.purposePlace,
      companyPlant: this.claimForm.value.companyPlant
    }));

    const employeeId = localStorage.getItem('employeeId');
    const Employeedetail = {
      employeeId: employeeId,
      type: this.selectedType,
      purposePlace: this.claimForm.value.purposePlace,
      companyPlant: this.claimForm.value.companyPlant,
      costCenter: this.claimForm.value.costCenter,
      vendorCode: this.claimForm.value.vendorCode
    };

    this.claimService.createClaim(Employeedetail).subscribe({
      next: (res: any) => {
        // Save claimId for expense page
        localStorage.setItem('claimId', res.claimId);
        
        // 🔥 TOAST: Claim Created
        this.toastService.show('Claim created', 'success');

        // Refresh table
        if (employeeId) {
          this.claimService.getClaimsByEmployeeId(employeeId)
            .subscribe((data: any) => this.claims = data);
        }
        this.closeModal();
        // Navigate to correct page
        switch (this.selectedType) {
          case 'General Expense':
            this.router.navigate(['/general-expense-entry']);
            break;
          case 'International Travel':
            this.router.navigate(['/intl-travel-details']);
            break;
          case 'Domestic Travel':
            this.router.navigate(['/domestic-travel-details']);
            break;
        }
      },
      error: (err: any) => {
        // 🔥 TOAST: Error
        this.toastService.show('Backend error', 'danger');
        console.error(err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'badge badge-success';
      case 'Pending': return 'badge badge-warning';
      case 'Rejected': return 'badge badge-danger';
      default: return 'badge badge-info';
    }
  }
}