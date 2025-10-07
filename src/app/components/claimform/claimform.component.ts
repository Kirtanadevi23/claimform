import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-claim',
  standalone: true,
  imports: [CommonModule, FormsModule, ClarityModule],
  templateUrl: './claimform.component.html',
  styleUrls: ['./claimform.component.css']
})
export class ClaimformComponent {

constructor(private router:Router) {}
  claims = [
    { type: 'General Expense', date: '2024-01-15', purpose: 'Office Supplies', amount: '$245.00', status: 'Pending' },
    { type: 'International Travel', date: '2024-01-10', purpose: 'Business Trip - London', amount: '$2,850.00', status: 'Approved' },
    { type: 'Domestic Travel', date: '2024-01-08', purpose: 'Client Meeting - Mumbai', amount: '$420.00', status: 'Rejected' }
  ];

  modalOpen = false;
  selectedType = '';
  username = 'Arun Kumar';
  today = new Date().toISOString().split('T')[0];


  formData = {
    employeeCode: '',
    purposePlace: '',
    companyPlant: '',
    costCenter: '',
    vendorCode: ''
  };

  openModal(type: string) {
    this.selectedType = type;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.formData = {
      employeeCode: '',
      purposePlace: '',
      companyPlant: '',
      costCenter: '',
      vendorCode: ''
    };
  }

  submitForm() {
  this.router.navigate(['/expense']);
    this.closeModal();
  }

  
  getIconShape(type: string): string {
  switch (type) {
    case 'General Expense': return 'wallet';
    case 'International Travel': return 'globe';
    case 'Domestic Travel': return 'plane';
    default: return 'info-circle';
  }
}

getTypeDescription(type: string): string {
  switch (type) {
    case 'General Expense': return 'Office supplies and meals';
    case 'International Travel': return 'Flights and hotels abroad';
    case 'Domestic Travel': return 'Local transportation';
    default: return '';
  }
}
getStatusClass(status: string): string {
  switch (status) {
    case 'Approved':
      return 'badge badge-success';
    case 'Pending':
      return 'badge badge-warning';
    case 'Rejected':
      return 'badge badge-danger';
    default:
      return 'badge badge-info';
  }
}
}