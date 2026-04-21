import { Component, OnInit } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AppHeaderComponent } from "../app-header/app-header.component";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClaimService } from '../../services/claim.service';
import { EmployeeService } from '../../services/employee.service';
import { ToastService } from '../../shared/toast.service';
import { TempDataService } from '../../services/temp-data.service';
import { CardcashService } from '../../services/cardcash.service';

import '@cds/core/icon/register.js';
import { ClarityIcons, eyeIcon, pencilIcon, trashIcon } from '@cds/core/icon';

ClarityIcons.addIcons(eyeIcon, pencilIcon, trashIcon);


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClarityModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  constructor(
    private router: Router,
    private claimService: ClaimService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private toastService: ToastService,
    public tempDataService: TempDataService,
    private route: ActivatedRoute,
    private cardcashService: CardcashService
  ) { }

  claims: any[] = [];
  claimForm!: FormGroup;
  modalOpen = false;
  selectedType = '';
  today = new Date().toISOString().split('T')[0];
  showAlert: boolean = false;
  // Store employee data here so we can re-populate after reset
  employeeData: any = null;

  // Withdraw state
  withdrawModalOpen = false;
  claimToWithdraw: any = null;


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

    /** ✅ CHECK FOR SUBMISSION SUCCESS FROM REVIEW PAGE */
    this.route.queryParams.subscribe(params => {
      if (params['submitted'] === 'true') {
        this.toastService.show('Claim submitted successfully', 'success');

        // Clear query parameters from URL without refreshing
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { submitted: null },
          queryParamsHandling: 'merge'
        });
      }
    });
  }
  populateEmployeeFields() {
    if (this.employeeData) {
      this.claimForm.patchValue({
        username: this.employeeData.employeeName || this.employeeData.name,
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
      vendorCode: this.claimForm.value.vendorCode,
      currentUser: this.employeeData?.employeeName || this.employeeData?.EmployeeName || this.employeeData?.name || localStorage.getItem('username') || 'System'
    };

    this.claimService.createClaim(Employeedetail).subscribe({
      next: (res: any) => {
        // Reset state for new claim
        this.tempDataService.clearState();

        // Save to Service (Persistence)
        this.tempDataService.claimId = res.claimId;
        this.tempDataService.employeeData = this.employeeData;
        this.tempDataService.claimDetails = {
          purposePlace: this.claimForm.value.purposePlace,
          companyPlant: this.claimForm.value.companyPlant
        };

        // Also update components that might still look at localStorage for now
        localStorage.setItem('claimId', res.claimId);

        // 🔥 TOAST: Claim Created
        this.toastService.show('Claim ID created successfully', 'success');

        // Refresh table
        if (employeeId) {
          this.claimService.getClaimsByEmployeeId(employeeId)
            .subscribe((data: any) => this.claims = data);
        }
        this.closeModal();
        // Navigate to correct page
        switch (this.selectedType) {
          case 'General Expense':
            this.router.navigate(['/general-expense-entry', res.claimId]);
            break;
          case 'International Travel':
            this.router.navigate(['/intl-travel-details', res.claimId]);
            break;
          case 'Domestic Travel':
            this.router.navigate(['/domestic-travel-details', res.claimId]);
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

  // --- ACTIONS ---

  viewClaim(claim: any) {
    this.prepareClaimData(claim, true);
  }

  editClaim(claim: any) {
    this.prepareClaimData(claim, false);
  }

  private prepareClaimData(claim: any, isViewOnly: boolean) {
    // Ensuring we have the identity details first
    if (!this.employeeData) {
      const employeeId = localStorage.getItem('employeeId');
      if (employeeId) {
        this.employeeService.getEmployeeById(employeeId).subscribe({
          next: (emp: any) => {
            this.employeeData = emp;
            this.executePrepare(claim, isViewOnly);
          },
          error: () => this.executePrepare(claim, isViewOnly) // Try anyway
        });
        return;
      }
    }
    this.executePrepare(claim, isViewOnly);
  }

  private executePrepare(claim: any, isViewOnly: boolean) {
    this.claimService.getClaimById(claim.claimId).subscribe({
      next: (fullClaim: any) => {
        // Reset and populate TempDataService
        this.tempDataService.clearState();
        this.tempDataService.claimId = fullClaim.claimId;

        // SET MODES
        this.tempDataService.isViewMode = isViewOnly;
        this.tempDataService.isEditMode = !isViewOnly;

        // Populate Personal / Claim Details (Meta data now comes from federated API response)
        this.tempDataService.employeeData = {
          employeeName: fullClaim.employeeName,
          employeeCode: fullClaim.employeeCode,
          costCentre: fullClaim.costCentre,
          vendorCode: fullClaim.vendorCode,
          companyPlant: fullClaim.companyPlant
        };
        this.tempDataService.claimDetails = {
          purposePlace: fullClaim.purpose,
          companyPlant: fullClaim.companyPlant
        };

        // IF TRAVEL: Fetch Card/Cash to get dates and currency
        if (fullClaim.type.includes('Travel')) {
          this.cardcashService.getByClaimId(fullClaim.claimId).subscribe({
            next: (entries: any[]) => {
              if (entries.length > 0) {
                const first = entries[0];
                const dsProps = {
                  selectedCurrency: first.currencyType || 'INR',
                  inrRate: first.inrRate || 1.0, // Default to 1 if missing
                  travelStart: first.startDate || '',
                  travelEnd: first.endDate || '',
                  numberOfDays: 0 // Will be calc'd on entry page
                };
                if (fullClaim.type === 'International Travel') {
                  this.tempDataService.intlTravelDetails = dsProps;
                } else {
                  // Domestic does not have inrRate in its service object structure (fixed to INR)
                  this.tempDataService.domesticTravelDetails = {
                    selectedCurrency: dsProps.selectedCurrency,
                    travelStart: dsProps.travelStart,
                    travelEnd: dsProps.travelEnd,
                    numberOfDays: dsProps.numberOfDays
                  };
                }
              }
              this.navigateToRoute(fullClaim.type, isViewOnly, fullClaim.claimId);
            },
            error: () => this.navigateToRoute(fullClaim.type, isViewOnly, fullClaim.claimId) // Fallback
          });
        } else {
          this.navigateToRoute(fullClaim.type, isViewOnly, fullClaim.claimId);
        }
      },
      error: (err) => {
        this.toastService.show('Failed to load claim details', 'danger');
        console.error(err);
      }
    });
  }

  private navigateToRoute(type: string, isViewOnly: boolean, claimId: string) {
    const route = this.getRouteByType(type, isViewOnly, claimId);
    this.router.navigate(route);
  }


  private getRouteByType(type: string, isViewOnly: boolean, claimId: string): any[] {
    if (isViewOnly) {
      switch (type) {
        case 'General Expense': return ['/general-expense-review', claimId];
        case 'International Travel': return ['/intl-expense-review', claimId];
        case 'Domestic Travel': return ['/domestic-expense-review', claimId];
        default: return ['/home-page'];
      }
    } else {
      switch (type) {
        case 'General Expense': return ['/general-expense-entry', claimId];
        case 'International Travel': return ['/intl-travel-details', claimId];
        case 'Domestic Travel': return ['/domestic-travel-details', claimId];
        default: return ['/home-page'];
      }
    }
  }

  openWithdrawModal(claim: any) {
    this.claimToWithdraw = claim;
    this.withdrawModalOpen = true;
  }

  confirmWithdraw() {
    if (!this.claimToWithdraw) return;

    const currentUser = this.employeeData?.employeeName || this.employeeData?.EmployeeName || this.employeeData?.name || localStorage.getItem('username') || 'System';

    this.claimService.withdrawClaim(this.claimToWithdraw.claimId, currentUser).subscribe({
      next: () => {
        this.toastService.show('Claim withdrawn successfully', 'success');
        this.withdrawModalOpen = false;
        // Refresh list
        this.ngOnInit();
      },
      error: (err) => {
        this.toastService.show('Withdrawal failed', 'danger');
        console.error(err);
      }
    });
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'badge badge-success';
      case 'Pending': return 'badge badge-warning';
      case 'Rejected': return 'badge badge-danger';
      case 'Withdrawn': return 'badge badge-danger';
      default: return 'badge badge-info';
    }
  }

  getSettlementInfo(val: number) {
    if (val < 0) return { color: 'green', text: 'Payable', abs: Math.abs(val) };
    if (val > 0) return { color: 'red', text: 'Recoverable', abs: Math.abs(val) };
    return { color: 'black', text: 'Settled', abs: 0 };
  }
}