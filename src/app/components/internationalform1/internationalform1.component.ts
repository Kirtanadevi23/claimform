import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { PersonalserviceService } from '../../services/personalservice.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Location } from '@angular/common';


@Component({
  selector: 'app-internationalform1',
  standalone: true,
  imports: [CommonModule, ClarityModule,FormsModule],
  templateUrl: './internationalform1.component.html',
  styleUrl: './internationalform1.component.css'
})
export class Internationalform1Component {
  personalData: any;
  expenses: any[] = [];
  preview: string | null = null;
  showModal = false;
  today: string = new Date().toISOString().split('T')[0];
selectedImage: string | null = null; // For popup image
  showImageModal: boolean = false;
  
  // Accordion toggles
  showPersonal: boolean = true;
  showExpenses = true;


  fileName: string | null = null;


  constructor(private service: PersonalserviceService, private router: Router,private location: Location) { }

  ngOnInit() {
    this.personalData = this.service.getDetails();
    this.expenses = this.service.getentries();

    console.log(this.personalData);
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.preview = null;
  }

  // onFileChange(event: any) {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.preview = reader.result as string;
  //   };
  //   reader.readAsDataURL(file);
  // }
  
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.fileName = file.name; 
  }

  openImageModal(image: string) {
    this.selectedImage = image;

    this.showImageModal = true; 

  }
  closeImageModal() {
    this.selectedImage = null;

    this.showImageModal = false; 

  }


  // addExpense(form: NgForm) {
  //   if (form.invalid) return;

  //   const newEntry = {
  //     ...form.value,
  //     preview: this.preview
  //   };

  //   this.expenses.push(newEntry);
  //   this.service.setentries(this.expenses);
  //   this.closeModal();
  //   form.resetForm();
  // }

   addExpense(form: NgForm) {
    if (form.invalid) return;

    const newEntry = {
      ...form.value,
      filename: this.fileName, 
      preview: this.preview 

    };

    this.expenses.push(newEntry);
    this.service.setentries(this.expenses);
    this.closeModal();
    form.resetForm();
  }


  review() {
    console.log('Review data:', this.expenses);
    this.router.navigate(['/internationalreview']);
  }

  cancel() {
    if (confirm('Clear all entries?')) {
      this.expenses = [];
    }
  }
      goBack(): void {
    // this.location.back(); // ✅ Navigates to previous page
    this.router.navigate(['/internationalform']);
  }
}
  


