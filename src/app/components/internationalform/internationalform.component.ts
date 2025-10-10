import { NgModule, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-internationalform',
  standalone: true,
  imports: [CommonModule, FormsModule, ClarityModule],
  templateUrl: './internationalform.component.html',
  styleUrl: './internationalform.component.css'
})
export class InternationalformComponent {


selectedCurrency = 'EUR';

  card = {
    inrRate: 0,
    totalLoaded: 0,
    loadedDate: ''
  };

  cash = {
    inrRate: 0,
    totalLoaded: 0,
    loadedDate: ''
  };

  cardEntries: any[] = [];
  cashEntries: any[] = [];

  travelStart: string = '';
  travelEnd: string = '';
  numberOfDays: number = 0;

  addCardEntry(form: any) {
    if (form.valid) {
      const totalINR = this.card.inrRate * this.card.totalLoaded;
      this.cardEntries.push({ ...this.card,currency:this.selectedCurrency, totalINR });
      console.log(this.cardEntries);
      form.resetForm();
    }
  }

  addCashEntry(form: any) {
    if (form.valid) {
      const totalINR = this.cash.inrRate * this.cash.totalLoaded;
      this.cashEntries.push({ ...this.cash, currency: this.selectedCurrency, totalINR });
      form.resetForm();
    }
  }

  calculateDays() {
    if (this.travelStart && this.travelEnd) {
      const start = new Date(this.travelStart).getTime();
      const end = new Date(this.travelEnd).getTime();
      const diff = (end - start) / (1000 * 60 * 60 * 24);
      this.numberOfDays = parseFloat(diff.toFixed(2));
    }
  }
}
