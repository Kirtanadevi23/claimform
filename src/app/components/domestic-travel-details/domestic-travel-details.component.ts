import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { CardcashService } from '../../services/cardcash.service';
import '@cds/core/icon/register.js';
import { ClarityIcons, pencilIcon, trashIcon } from '@cds/core/icon';

// Register icons
ClarityIcons.addIcons(pencilIcon, trashIcon);

@Component({
  selector: 'app-domestic-travel-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ClarityModule],
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
    private location: Location,
    private cardcashService: CardcashService
  ) { }

  // -------------------- TRAVEL DETAILS --------------------
  selectedCurrency = 'INR';
  travelStart: string = '';
  travelEnd: string = '';
  numberOfDays: number = 0;
  today: string = '';
  startDateError = false;
  endDateError = false;

  // -------------------- FORM MODELS --------------------
  card = { inrRate: 0, totalLoaded: 0, loadedDate: '' };
  cash = { inrRate: 0, totalLoaded: 0, loadedDate: '' };

  // -------------------- TABLE DATA --------------------
  cardEntries: any[] = [];
  cashEntries: any[] = [];

  // -------------------- EDIT MODAL --------------------
  showEditModal = false;
  editData: any = {};
  editIndex: number = -1;
  editType: 'card' | 'cash' = 'card';

  // -------------------- DELETE MODAL --------------------
  showDeleteModal = false;
  itemToDeleteIndex: number = -1;
  deleteType: 'card' | 'cash' | '' = '';

  // -------------------- UI FLAGS --------------------
  cardTouched = false;
  cashTouched = false;

  /**
   * On Init
   */
  ngOnInit(): void {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.today = now.toISOString().slice(0, 16);
  }

  get todayDateOnly(): string {
    return this.today.split('T')[0];
  }

  /**
   * Enable bottom panels only after travel details
   */
  canEnableBottomPanels(): boolean {
    return !!(this.selectedCurrency && this.travelStart && this.travelEnd && !this.startDateError && !this.endDateError);
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

    // ❌ future not allowed
    this.startDateError = start > now;

    // reset end date if invalid
    this.travelEnd = '';
    this.numberOfDays = 0;
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

    // ❌ future OR before start
    this.endDateError = end > now || end < start;
    this.calculateDays();
  }

  get travelEndDateOnly(): string {
    return this.travelEnd ? this.travelEnd.split('T')[0] : '';
  }

  /**
   * Calculate number of days
   */
  calculateDays(): void {
    if (!this.startDateError && !this.endDateError && this.travelStart && this.travelEnd) {
      const start = new Date(this.travelStart).getTime();
      const end = new Date(this.travelEnd).getTime();
      const diff = (end - start) / (1000 * 60 * 60 * 24);
      this.numberOfDays = parseFloat(diff.toFixed(2));
    } else {
      this.numberOfDays = 0;
    }
  }

  /**
   * Add Card Entry → Save to DB
   */
  addCardEntry(form: any): void {
    if (form.valid) {
      const claimId = localStorage.getItem("claimId");
      const payload = {
        claimId: claimId,
        type: "Card",
        currencyType: this.selectedCurrency,
        startDate: this.travelStart,
        endDate: this.travelEnd,
        inrRate: this.card.inrRate,
        totalLoaded: this.card.totalLoaded
      };

      // API CALL → SAVE IN DB
      this.cardcashService.addCardCash(payload).subscribe({
        next: (res: any) => {
          const totalINR = res.inrRate * res.totalLoaded;

          // Store response with ID and explicitly inject loadedDate for UI list sync
          this.cardEntries.push({
            ...res,
            loadedDate: this.card.loadedDate,
            totalINR
          });
          form.resetForm();
        },
        error: (err) => console.error(err)
      });
    }
  }

  /**
   * Add Cash Entry → Save to DB
   */
  addCashEntry(form: any): void {
    if (form.valid) {
      const claimId = localStorage.getItem("claimId");
      const payload = {
        claimId: claimId,
        type: "Cash",
        currencyType: this.selectedCurrency,
        startDate: this.travelStart,
        endDate: this.travelEnd,
        inrRate: this.cash.inrRate,
        totalLoaded: this.cash.totalLoaded
      };

      this.cardcashService.addCardCash(payload).subscribe({
        next: (res: any) => {
          const totalINR = res.inrRate * res.totalLoaded;

          // Explicitly map loadedDate so it previews in the UI immediately
          this.cashEntries.push({
            ...res,
            loadedDate: this.cash.loadedDate,
            totalINR
          });
          form.resetForm();
        },
        error: (err) => console.error(err)
      });
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
   * Final Confirm Deletion
   */
  confirmDelete(): void {
    if (this.itemToDeleteIndex === -1) return;

    if (this.deleteType === 'card') {
      const item = this.cardEntries[this.itemToDeleteIndex];
      this.cardcashService.deleteCardCash(item.cardCashId).subscribe(() => {
        this.cardEntries.splice(this.itemToDeleteIndex, 1);
        this.closeDeleteModal();
      });
    } else if (this.deleteType === 'cash') {
      const item = this.cashEntries[this.itemToDeleteIndex];
      this.cardcashService.deleteCardCash(item.cardCashId).subscribe(() => {
        this.cashEntries.splice(this.itemToDeleteIndex, 1);
        this.closeDeleteModal();
      });
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
    this.editData = { ...this.cardEntries[index] };
    this.editIndex = index;
    this.editType = 'card';
    this.showEditModal = true;
  }

  /**
   * Open edit modal for Cash
   */
  editCashEntry(index: number): void {
    this.editData = { ...this.cashEntries[index] };
    this.editIndex = index;
    this.editType = 'cash';
    this.showEditModal = true;
  }

  /**
   * Update entry → API CALL
   */
  updateEntry(form: any): void {
    if (form.valid) {
      const payload = {
        inrRate: this.editData.inrRate,
        totalLoaded: this.editData.totalLoaded
      };

      this.cardcashService.updateCardCash(this.editData.cardCashId, payload)
        .subscribe({
          next: () => {
            this.editData.totalINR = this.editData.inrRate * this.editData.totalLoaded;

            if (this.editType === 'card') {
              this.cardEntries[this.editIndex] = { ...this.editData };
            } else {
              this.cashEntries[this.editIndex] = { ...this.editData };
            }
            this.showEditModal = false;
          },
          error: (err) => {
            console.error(err);
            // In case backend rejects, just update locally so UI doesn't freeze
            this.editData.totalINR = this.editData.inrRate * this.editData.totalLoaded;
            if (this.editType === 'card') {
              this.cardEntries[this.editIndex] = { ...this.editData };
            } else {
              this.cashEntries[this.editIndex] = { ...this.editData };
            }
            this.showEditModal = false;
          }
        });
    }
  }

  /**
   * Cancel edit
   */
  cancelEdit(): void {
    this.showEditModal = false;
  }

  /**
   * Proceed
   */
  proceed(): void {
    this.router.navigate(['/domestic-expense-entry']);
  }

  /**
   * Go back
   */
  goBack(): void {
    this.router.navigate(['/home-page']);
  }
}
