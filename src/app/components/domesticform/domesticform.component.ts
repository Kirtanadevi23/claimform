import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PersonalserviceService } from '../../services/personalservice.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-domesticform',
  standalone: true,
  imports: [CommonModule, FormsModule, ClarityModule],
  templateUrl: './domesticform.component.html',
  styleUrl: './domesticform.component.css'
})
export class DomesticformComponent {
constructor(private router: Router,private service:PersonalserviceService, private location: Location) {}
selectedCurrency = 'INR';
  travelStart: string = '';
  travelEnd: string = '';
  numberOfDays: number = 0;
  today: string = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  card = { inrRate: 0, totalLoaded: 0, loadedDate: '' };
  cash = { inrRate: 0, totalLoaded: 0, loadedDate: '' };
  cardEntries: any[] = [];
  cashEntries: any[] = [];
cardTouched: boolean = false;
cashTouched: boolean = false;

showEditModal = false;
editData: any = {};
editIndex: number = -1;
editType: 'card' | 'cash' = 'card';


ngOnInit(): void {
  
  this.today= new Date().toISOString().slice(0, 16);
}

canEnableBottomPanels(): boolean {
  return !!(this.selectedCurrency && this.travelStart && this.travelEnd);
}

  onStartDateChange(): void {
    this.travelEnd = ''; // Reset end date
    this.calculateDays();
  }

  addCardEntry(form: any) {
    if (form.valid) {
      const totalINR = this.card.inrRate * this.card.totalLoaded;
      this.cardEntries.push({ ...this.card,currency:this.selectedCurrency, totalINR });
      console.log(this.cardEntries);
      form.resetForm();
    }
  }

   get travelEndDateOnly(): string {
    return this.travelEnd ? this.travelEnd.split('T')[0] : '';
  }


  addCashEntry(form: any) {
    if (form.valid) {
      const totalINR = this.cash.inrRate * this.cash.totalLoaded;
      this.cashEntries.push({ ...this.cash, currency: this.selectedCurrency, totalINR });
      console.log(this.cashEntries);
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


  calculateDays() {
    if (this.travelStart && this.travelEnd) {
      const start = new Date(this.travelStart).getTime();
      const end = new Date(this.travelEnd).getTime();
      const diff = (end - start) / (1000 * 60 * 60 * 24);
      this.numberOfDays = parseFloat(diff.toFixed(2));
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





  
  proceed(){
    const advance=this.totalEnteries;
    this.service.setTotalAllowance(advance);
        //this.service.setTotalAllowance(this.totalEnteries);

    this.router.navigate(['/domesticform1']);
    
  }
  
  goBack(): void {
    // this.location.back(); // ✅ Navigates to previous page
    this.router.navigate(['']);
  }
}
