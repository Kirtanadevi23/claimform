import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PersonalserviceService } from '../../personalservice.service';

@Component({
  selector: 'app-claim',
  standalone: true,
  imports: [CommonModule, FormsModule, ClarityModule],
  templateUrl: './claimform.component.html',
  styleUrls: ['./claimform.component.css']
})
export class ClaimformComponent implements OnInit {

constructor(private router:Router,private Service:PersonalserviceService) {}
  claims:any= [
    
  ];
ngOnInit(): void {
  const details = this.Service.getDetails();
  this.claims = this.Service.getExpense();
}
  modalOpen = false;
  selectedType = '';
  today = new Date().toISOString().split('T')[0];


  formData = {
    username :'',
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
      username :'',
      employeeCode: '',
      purposePlace: '',
      companyPlant: '',
      costCenter: '',
      vendorCode: ''
    };
  }

  submitForm() {
this.Service.setDetails(this.formData);

 switch (this.selectedType) {
    case 'General Expense':
      this.router.navigate(['/expense']);
      break;
    case 'International Travel':
      this.router.navigate(['/international']);
      break;
    case 'Domestic Travel':
      this.router.navigate(['/domestic']);
      break;
    default:
      this.router.navigate(['/expense']); // fallback
  }

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