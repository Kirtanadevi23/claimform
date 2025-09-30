import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ClarityModule, ClrAccordionModule } from '@clr/angular';
import { ExpenseComponent } from '../expense/expense.component';

@Component({
  selector: 'app-claimform',
  standalone: true,
  imports: [ClarityModule,CommonModule,FormsModule,ExpenseComponent,ClrAccordionModule],
  templateUrl: './claimform.component.html',
  styleUrl: './claimform.component.css'
})
export class ClaimformComponent {

modalOpen = false;
  today: string = '';
  username: string = 'Arun Kumar'; // Placeholder for Windows username

  formData = {
    employeeCode: '',
    purposePlace: '',
    companyPlant: '',
    costCenter: '',
    vendorCode: ''
  };

  ngOnInit() {
    const now = new Date();
    this.today = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  openModal() {
    this.modalOpen = true;
  }

  closeModal(form: any) {
    this.modalOpen = false;
    form.resetForm();
  }

  onNext(form: any) {
    if (form.valid) {
      alert('Form submitted:\n' + JSON.stringify(this.formData, null, 2));
      this.closeModal(form);
    }
  }
  selected:string=''; 

  onClick(click:string){
    this.selected=click;
  }
}

