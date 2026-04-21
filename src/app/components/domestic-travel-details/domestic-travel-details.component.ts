import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CardcashService } from '../../services/cardcash.service';
import { ToastService } from '../../shared/toast.service';
import { TempDataService } from '../../services/temp-data.service';
import { ExpenseService } from '../../services/expense.service';
import { ClaimService } from '../../services/claim.service';
import { forkJoin } from 'rxjs';
import '@cds/core/icon/register.js';
import { ClarityIcons, pencilIcon, trashIcon } from '@cds/core/icon';

// Register icons
ClarityIcons.addIcons(pencilIcon, trashIcon);

@Component({
  selector: 'app-domestic-travel-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClarityModule],
  templateUrl: './domestic-travel-details.component.html',
  styleUrl: './domestic-travel-details.component.css'
})
export class DomesticTravelDetailsComponent implements OnInit {
  /**
   * Constructor
   * Injecting required services
   */
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private location: Location,
    private cardcashService: CardcashService,
    private toastService: ToastService,
    public tempDataService: TempDataService,
    private claimService: ClaimService,
    private route: ActivatedRoute
  ) { }

  // -------------------- FORMS --------------------
  travelForm!: FormGroup;
  cardForm!: FormGroup;
  cashForm!: FormGroup;
  editModalForm!: FormGroup;

  // -------------------- TABLE DATA (Synced with Service) --------------------
  get claimId() { return this.tempDataService.claimId; }
  get cardEntries() { return this.tempDataService.cardEntries; }
  get cashEntries() { return this.tempDataService.cashEntries; }

  // -------------------- UI FLAGS --------------------
  today: string = '';
  startDateError = false;
  endDateError = false;
  cardTouched = false;
  cashTouched = false;

  // -------------------- MODAL STATE --------------------
  showEditModal = false;
  editIndex: number = -1;
  editType: 'card' | 'cash' = 'card';
  showDeleteModal = false;
  itemToDeleteIndex = -1;
  deleteType: 'card' | 'cash' | '' = '';

  /**
   * On Init
   */
  ngOnInit(): void {
    const now = new Date();
    this.today = now.toISOString().slice(0, 16);

    // 0. Recover claimId from URL
    const routeClaimId = this.route.snapshot.paramMap.get('claimId');
    if (routeClaimId) {
      this.tempDataService.claimId = routeClaimId;
    }

    // 1. Initialize Forms
    this.travelForm = this.fb.group({
      currency: ['INR', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      numberOfDays: [{ value: 0, disabled: true }]
    });

    this.cardForm = this.fb.group({
      inrRate: [{ value: 1, disabled: true }, Validators.required],
      totalLoaded: ['', [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required]
    });

    this.cashForm = this.fb.group({
      inrRate: [{ value: 1, disabled: true }, Validators.required],
      totalLoaded: ['', [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required]
    });

    this.editModalForm = this.fb.group({
      inrRate: [{ value: 1, disabled: true }, [Validators.required, Validators.min(0)]],
      totalLoaded: [null, [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required]
    });

    // 2. Sync from Service
    const ds = this.tempDataService.domesticTravelDetails;
    if (ds.travelStart) {
      this.travelForm.patchValue({
        currency: ds.selectedCurrency || 'INR',
        startDate: ds.travelStart,
        endDate: ds.travelEnd,
      });
      this.calculateDays();
    }

    if (this.claimId) {
      // 2. Load unified basic data & Entries
      this.loadClaimData();
    }

    // 3. Listen for date changes
    this.travelForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateStartDate();
      this.calculateDays();
      this.syncDatesToService();
    });
    this.travelForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateEndDate();
      this.calculateDays();
      this.syncDatesToService();
    });
  }

  get travelStart() { return this.travelForm.get('startDate')?.value; }
  get travelEnd() { return this.travelForm.get('endDate')?.value; }
  get selectedCurrency() { return this.travelForm.get('currency')?.value; }

  /**
   * Summary: Fetches employee info and claim data from the backend.
   */
  loadClaimData() {
    this.claimService.getClaimById(this.claimId!).subscribe({
      next: (fullClaim: any) => {
        // Update employee info
        this.tempDataService.employeeData = {
          employeeName: fullClaim.employeeName,
          employeeCode: fullClaim.employeeCode,
          costCentre: fullClaim.costCentre,
          vendorCode: fullClaim.vendorCode,
          companyPlant: fullClaim.companyPlant
        };
        // Update claim details
        this.tempDataService.claimDetails = {
          purposePlace: fullClaim.purpose,
          companyPlant: fullClaim.companyPlant
        };

        // If in view mode, disable forms
        if (this.tempDataService.isViewMode) {
          this.travelForm.disable();
          this.cardForm.disable();
          this.cashForm.disable();
        }

        // Load card/cash entries
        this.loadTravelDetails();
      }
    });
  }

  loadTravelDetails() {
    this.cardcashService.getByClaimId(this.claimId!).subscribe({
      next: (data: any) => {
        // Map date if the backend returns loadedDate
        data.forEach((e: any) => {
          e.date = e.date || e.loadedDate || e.LoadedDate || '';
          if (e.date && e.date.includes('T')) {
            e.date = e.date.split('T')[0]; // Format correctly for input type="date"
          }
        });
        // Split data into card and cash based on 'type'
        this.tempDataService.cardEntries = data.filter((e: any) => e.type === 'Card');
        this.tempDataService.cashEntries = data.filter((e: any) => e.type === 'Cash');
        // Calculate totals locally for each loaded entry
        this.tempDataService.cardEntries.forEach(e => e.totalINR = e.inrRate * e.totalLoaded);
        this.tempDataService.cashEntries.forEach(e => e.totalINR = e.inrRate * e.totalLoaded);

        // SYNC DATES from first found entry if form is empty
        if (!this.travelForm.get('startDate')?.value && data.length > 0) {
          const first = data[0];
          this.travelForm.patchValue({
            currency: first.currencyType || 'INR',
            startDate: first.startDate,
            endDate: first.endDate
          });
          this.calculateDays();
          this.syncDatesToService();
        }
      },
      error: (err) => console.error('Error loading travel details:', err)
    });
  }

  syncDatesToService(): void {
    if (this.travelForm.valid) {
      this.tempDataService.domesticTravelDetails = {
        selectedCurrency: this.selectedCurrency,
        travelStart: this.travelStart,
        travelEnd: this.travelEnd,
        numberOfDays: this.travelForm.get('numberOfDays')?.value
      };
    }
  }

  get todayDateOnly(): string {
    return this.today.split('T')[0];
  }

  canEnableBottomPanels(): boolean {
    return this.travelForm.valid && !this.startDateError && !this.endDateError;
  }

  /**
   * Validate START DATE
   * RULE:
   * - must be <= today
   */
  validateStartDate(): void {
    if (!this.travelStart) {
      this.startDateError = false;
      return;
    }
    const start = new Date(this.travelStart).getTime();
    const now = new Date().getTime();

    this.startDateError = start > now; // Error if in the future

    if (this.startDateError) {
      this.travelForm.patchValue({ endDate: '' }, { emitEvent: false });
      this.travelForm.get('numberOfDays')?.setValue(0, { emitEvent: false });
      this.syncDatesToService();
    }
  }

  /**
  * Validate END DATE
  * RULE:
  * - must be <= today
  * - must be >= start date
  */
  validateEndDate(): void {
    if (!this.travelEnd || !this.travelStart) {
      this.endDateError = false;
      return;
    }
    const start = new Date(this.travelStart).getTime();
    const end = new Date(this.travelEnd).getTime();
    const now = new Date().getTime();

    // RULE: End Date must be >= Start Date AND <= Today
    this.endDateError = end > now || end < start;
    this.calculateDays();
    this.syncDatesToService();
  }

  get travelEndDateOnly(): string {
    return this.travelEnd ? this.travelEnd.split('T')[0] : '';
  }

  get maxLoadedDate(): string {
    return this.travelEnd ? this.travelEnd.split('T')[0] : this.todayDateOnly;
  }

  /**
   * Calculate number of days
   */
  calculateDays(): void {
    const startVal = this.travelStart;
    const endVal = this.travelEnd;

    if (!this.startDateError && !this.endDateError && startVal && endVal) {
      const start = new Date(startVal).getTime();
      const end = new Date(endVal).getTime();
      const diff = (end - start) / (1000 * 60 * 60 * 24);
      const days = parseFloat(diff.toFixed(2));
      this.travelForm.get('numberOfDays')?.setValue(days, { emitEvent: false });
    } else {
      this.travelForm.get('numberOfDays')?.setValue(0, { emitEvent: false });
    }
  }

  /**
   * Add Card Entry → Local only
   */
  addCardEntry(): void {
    if (this.cardForm.valid) {
      const val = this.cardForm.getRawValue();
      const totalINR = val.inrRate * val.totalLoaded;
      this.cardEntries.push({
        type: "Card",
        currencyType: this.selectedCurrency,
        startDate: this.travelStart,
        endDate: this.travelEnd,
        inrRate: val.inrRate,
        totalLoaded: val.totalLoaded,
        date: val.date,
        totalINR,
        isNew: true
      });
      this.toastService.show('Card details added', 'info');
      this.cardForm.reset({ inrRate: 1, totalLoaded: null, date: '' });
    }
  }

  /**
   * Add Cash Entry → Local only
   */
  addCashEntry(): void {
    if (this.cashForm.valid) {
      const val = this.cashForm.getRawValue();
      const totalINR = val.inrRate * val.totalLoaded;
      this.cashEntries.push({
        type: "Cash",
        currencyType: this.selectedCurrency,
        startDate: this.travelStart,
        endDate: this.travelEnd,
        inrRate: val.inrRate,
        totalLoaded: val.totalLoaded,
        date: val.date,
        totalINR,
        isNew: true
      });
      this.toastService.show('Cash details added', 'info');
      this.cashForm.reset({ inrRate: 1, totalLoaded: null, date: '' });
    }
  }

  /**
   * Delete Card Entry → Open Confirmation Modal
   */
  deleteCardEntry(index: number): void {
    this.itemToDeleteIndex = index;
    this.deleteType = 'card';
    this.showDeleteModal = true;
  }

  /**
   * Delete Cash Entry → Open Confirmation Modal
   */
  deleteCashEntry(index: number): void {
    this.itemToDeleteIndex = index;
    this.deleteType = 'cash';
    this.showDeleteModal = true;
  }

  /**
   * Final Confirm Deletion (Local queue)
   */
  confirmDelete(): void {
    if (this.itemToDeleteIndex === -1) return;

    let item: any;
    if (this.deleteType === 'card') {
      item = this.cardEntries[this.itemToDeleteIndex];
    } else if (this.deleteType === 'cash') {
      item = this.cashEntries[this.itemToDeleteIndex];
    }

    if (item && item.cardCashId) {
      this.toastService.show('Deleting from server...', 'info');
      this.cardcashService.deleteCardCash(item.cardCashId).subscribe({
        next: () => {
          if (this.deleteType === 'card') {
            this.cardEntries.splice(this.itemToDeleteIndex, 1);
          } else {
            this.cashEntries.splice(this.itemToDeleteIndex, 1);
          }
          this.toastService.show('Item deleted from server', 'success');
          this.closeDeleteModal();
        },
        error: (err) => {
          this.toastService.show('Failed to delete from server', 'danger');
          console.error(err);
        }
      });
    } else {
      // Remove locally
      if (this.deleteType === 'card') {
        this.cardEntries.splice(this.itemToDeleteIndex, 1);
      } else if (this.deleteType === 'cash') {
        this.cashEntries.splice(this.itemToDeleteIndex, 1);
      }
      this.toastService.show('Item removed', 'info');
      this.closeDeleteModal();
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.itemToDeleteIndex = -1;
    this.deleteType = '';
  }

  /**
   * Open edit modal for Card
   */
  editCardEntry(index: number): void {
    const item = this.cardEntries[index];
    this.editModalForm.patchValue({
      inrRate: item.inrRate,
      totalLoaded: item.totalLoaded,
      date: item.date
    });
    this.editIndex = index;
    this.editType = 'card';
    this.showEditModal = true;
  }

  editCashEntry(index: number): void {
    const item = this.cashEntries[index];
    this.editModalForm.patchValue({
      inrRate: item.inrRate,
      totalLoaded: item.totalLoaded,
      date: item.date
    });
    this.editIndex = index;
    this.editType = 'cash';
    this.showEditModal = true;
  }

  updateEntry(): void {
    if (this.editModalForm.valid) {
      const val = this.editModalForm.getRawValue();
      const originalItem = this.editType === 'card' ? this.cardEntries[this.editIndex] : this.cashEntries[this.editIndex];

      const updatedEntry = {
        ...originalItem,
        ...val,
        totalINR: val.inrRate * val.totalLoaded
      };

      if (this.editType === 'card') {
        this.cardEntries[this.editIndex] = updatedEntry;
        if (updatedEntry.cardCashId) this.cardEntries[this.editIndex].isUpdated = true;
      } else {
        this.cashEntries[this.editIndex] = updatedEntry;
        if (updatedEntry.cardCashId) this.cashEntries[this.editIndex].isUpdated = true;
      }

      this.toastService.show('Update complete', 'info');
      this.showEditModal = false;
    }
  }

  /**
   * Cancel edit
   */
  cancelEdit(): void {
    this.showEditModal = false;
    this.editModalForm.reset();
  }

  blockNonNumeric(event: KeyboardEvent) {
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
    if (!chars.includes(event.key)) {
      event.preventDefault();
    }
  }

  onModalOpenChange(open: boolean) {
    if (!open) {
      this.cancelEdit();
    }
  }

  /**
   * Proceed → Sync all changes (Add, Update, Delete) to API
   */
  proceed(): void {
    const claimId = this.tempDataService.claimId;
    if (!claimId) {
      this.toastService.show('No claim session found', 'danger');
      return;
    }

    const newItems = [
      ...this.cardEntries.filter(e => e.isNew),
      ...this.cashEntries.filter(e => e.isNew)
    ];

    const updatedItems = [
      ...this.cardEntries.filter(e => e.isUpdated),
      ...this.cashEntries.filter(e => e.isUpdated)
    ];

    const deletedIds = [
      ...this.tempDataService.domesticCardDeletes,
      ...this.tempDataService.domesticCashDeletes
    ];

    if (newItems.length === 0 && updatedItems.length === 0 && deletedIds.length === 0) {
      this.router.navigate(['/domestic-expense-entry', claimId]);
      return;
    }

    this.toastService.show('Syncing details...', 'info');

    const requests: any[] = [];

    // 1. ADD NEW
    newItems.forEach(e => {
      requests.push(this.cardcashService.addCardCash({
        claimId,
        type: e.type,
        currencyType: e.currencyType,
        startDate: e.startDate,
        endDate: e.endDate,
        inrRate: e.inrRate,
        totalLoaded: e.totalLoaded,
        date: e.date,
        loadedDate: e.date,
        currentUser: this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System'
      }));
    });

    // 2. UPDATE EXISTING
    updatedItems.forEach(e => {
      requests.push(this.cardcashService.updateCardCash(e.cardCashId, {
        cardCashId: e.cardCashId,
        claimId,
        type: e.type,
        currencyType: e.currencyType,
        startDate: e.startDate,
        endDate: e.endDate,
        inrRate: e.inrRate,
        totalLoaded: e.totalLoaded,
        date: e.date,
        loadedDate: e.date,
        currentUser: this.tempDataService.employeeData?.employeeName || this.tempDataService.employeeData?.EmployeeName || this.tempDataService.employeeData?.name || localStorage.getItem('username') || 'System'
      }));
    });

    // 3. DELETE REMOVED
    deletedIds.forEach(id => {
      requests.push(this.cardcashService.deleteCardCash(id));
    });

    forkJoin(requests).subscribe({
      next: () => {
        // Cleanup flags and clear local state to force reload with real IDs from DB
        this.tempDataService.cardEntries = [];
        this.tempDataService.cashEntries = [];
        this.tempDataService.domesticCardDeletes = [];
        this.tempDataService.domesticCashDeletes = [];

        this.toastService.show('Card/Cash details loaded successfully', 'success');
        this.router.navigate(['/domestic-expense-entry', claimId]);
      },
      error: (err) => {
        this.toastService.show('Sync failed', 'danger');
        console.error(err);
      }
    });
  }

  /**
   * Go back
   */
  goBack(): void {
    if (this.tempDataService.isViewMode) {
      this.router.navigate(['/home-page']);
    } else {
      this.router.navigate(['/home-page']); // or prev page if we want to add that
    }
  }

  onClose(): void {
    this.router.navigate(['/home-page']);
  }

  /**
   * Show toast when Card disabled block is clicked
   */
  onCardClick(): void {
    this.toastService.show('Card is not needed for domestic travel', 'info');
  }
}
