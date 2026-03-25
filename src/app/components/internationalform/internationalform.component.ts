import { NgModule, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PersonalserviceService } from '../../services/personalservice.service';
import { Location } from '@angular/common';
import '@cds/core/icon/register.js';
import { ClarityIcons, pencilIcon, trashIcon } from '@cds/core/icon';
ClarityIcons.addIcons(pencilIcon, trashIcon);

@Component({
  selector: 'app-internationalform',
  standalone: true,
  imports: [CommonModule, FormsModule, ClarityModule],
  templateUrl: './internationalform.component.html',
  styleUrl: './internationalform.component.css'
})
export class InternationalformComponent implements OnInit{
  constructor(private router: Router ,private service:PersonalserviceService,private location: Location) {}

  selectedCurrency = 'INR';
  travelStart: string = '';
  travelEnd: string = '';
  numberOfDays: number = 0;
today:string='';
  yesterday: string = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // ✅ One day before today

  startDateError = false;
  endDateError = false;

  card = { inrRate: 0, totalLoaded: 0, loadedDate: '' };
  cash = { inrRate: 0, totalLoaded: 0, loadedDate: '' };
  cardEntries: any[] = [];
  cashEntries: any[] = [];
  
showEditModal = false;
editData: any = {};
editIndex: number = -1;
editType: 'card' | 'cash' = 'card';


cardTouched: boolean = false;
cashTouched: boolean = false;

ngOnInit(): void {
  
  this.today= new Date().toISOString().slice(0, 16);
}
canEnableBottomPanels(): boolean {
  return !!(this.selectedCurrency && this.travelStart && this.travelEnd);
}

  isTodayDate(date: string): boolean {
    if (!date) return false;
    return date.startsWith(this.today); // Compare only date part
  }

  // validateStartDate(): void {
  //   if (this.travelStart) {
  //     // Compare date-only values so any time on the same day is considered 'today'
  //     const startDateObj = new Date(this.travelStart);
  //     const startOnly = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate()).getTime();
  //     const todayObj = new Date();
  //     const todayOnly = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate()).getTime();
  //     // Start date cannot be today or a future date
  //     this.startDateError = startOnly >= todayOnly;
  //   } else {
  //     this.startDateError = false;
  //   }
  //   this.calculateDays();
  // }
  validateStartDate(): void {
    if (this.travelStart) {
      const start = new Date(this.travelStart).getTime();
      const now = new Date().getTime();
      this.startDateError = start >= now; // Today or future date is invalid
    } else {
      this.startDateError = false;
    }
    this.calculateDays();
  }

validateEndDate(): void {
    if (this.travelEnd) {
      const start = new Date(this.travelStart).getTime();
      const end = new Date(this.travelEnd).getTime();
      const now = new Date().getTime();
      this.endDateError = end <= start || end > now; // Must be after start and not exceed today
    } else {
      this.endDateError = false;
    }
    this.calculateDays();
  }

  onStartDateChange(): void {
    this.travelEnd = ''; // Reset end date
    this.calculateDays();
  }

  calculateDays(): void {
    if (!this.startDateError && !this.endDateError && this.travelStart && this.travelEnd) {
      const start = new Date(this.travelStart).getTime();
      const end = new Date(this.travelEnd).getTime();
      if (end >= start) {
        const diff = (end - start) / (1000 * 60 * 60 * 24);
        this.numberOfDays = parseFloat(diff.toFixed(2));
      } else {
        this.numberOfDays = 0;
      }
    } else {
      this.numberOfDays = 0;
    }
  }

  // calculateDays(): void {
  //   if (this.travelStart && this.travelEnd) {
  //     const start = new Date(this.travelStart).getTime();
  //     const end = new Date(this.travelEnd).getTime();

  //     if (end >= start) {
  //       const diff = (end - start) / (1000 * 60 * 60 * 24);
  //       this.numberOfDays = parseFloat(diff.toFixed(2));
  //     } else {
  //       this.numberOfDays = 0;
  //     }
  //   }
  // }

  get travelEndDateOnly(): string {
    return this.travelEnd ? this.travelEnd.split('T')[0] : '';
  }

  addCardEntry(form: any): void {
    if (form.valid) {
      const totalINR = this.card.inrRate * this.card.totalLoaded;
      this.cardEntries.push({ ...this.card, currency: this.selectedCurrency, totalINR });
      form.resetForm();
    }
  }

   get totalEnteries(){
    let allowance=0;
    let total;
    // const cardvalue=this.travelService.getCardEntries();
    // const cashvalue=this.travelService.getCashEntries();
this.cardEntries.forEach(x=>{
  allowance +=x['totalINR']
})
 
this.cashEntries.forEach(x=>{
  allowance +=x['totalINR']
})
return allowance
  }

  addCashEntry(form: any): void {
    if (form.valid) {
      const totalINR = this.cash.inrRate * this.cash.totalLoaded;
      this.cashEntries.push({ ...this.cash, currency: this.selectedCurrency, totalINR });
      form.resetForm();
    }
  }

  


  
deleteCardEntry(index: number): void {
  this.cardEntries.splice(index, 1);
}

deleteCashEntry(index: number): void {
  this.cashEntries.splice(index, 1);
}

editCardEntry(index: number): void {
  this.editData = { ...this.cardEntries[index] };
  this.editIndex = index;
  this.editType = 'card';
  this.showEditModal = true;
}

editCashEntry(index: number): void {
  this.editData = { ...this.cashEntries[index] };
  this.editIndex = index;
  this.editType = 'cash';
  this.showEditModal = true;
}

updateEntry(form: any): void {
  if (form.valid) {
    this.editData.totalINR = this.editData.inrRate * this.editData.totalLoaded;
    if (this.editType === 'card') {
      this.cardEntries[this.editIndex] = { ...this.editData };
    } else {
      this.cashEntries[this.editIndex] = { ...this.editData };
    }
    this.showEditModal = false;
  }
}
cancelEdit(): void {
  this.showEditModal = false;
  this.editData = {};
  this.editIndex = -1;
}



  proceed(): void {
    this.service.setTotalAllowance(this.totalEnteries);
    this.router.navigate(['/internationalform1']);
  }
     goBack(): void {
        // this.location.back(); // ✅ Navigates to previous page
        this.router.navigate(['']);
  }
}