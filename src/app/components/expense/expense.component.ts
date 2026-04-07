// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, NgForm } from '@angular/forms';
// import { ClarityModule } from '@clr/angular';
// import { PersonalserviceService } from '../../services/personalservice.service';
// import { Router } from '@angular/router';
// import { Location } from '@angular/common';




// @Component({
//   selector: 'app-expense',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ClarityModule],
//   templateUrl: './expense.component.html',
//   styleUrls: ['./expense.component.css']
// })
// export class ExpenseComponent implements OnInit {
//   constructor(private service: PersonalserviceService, private router: Router, private location: Location) {}

//   personalData: any;
//   showModal = false;
//   preview: string | null = null;

//   selectedImage: string | null = null; // For popup image
//   showImageModal: boolean = false;
//   expenses: any[] = [];
//   today: string = new Date().toISOString().split('T')[0];

//   // Accordion toggles
//   showPersonal: boolean = true;
//   showExpenses = true;


//   fileName: string | null = null;




//   ngOnInit() {
//     this.personalData = this.service.getDetails();
//   }

//   openModal() {
//     this.showModal = true;
//   }

//   // closeModal() {
//   //   this.showModal = false;
//   //   // this.preview = null;
//   // }

//   // onFileChange(event: any) {
//   //   const file = event.target.files[0];
//   //   if (!file) return;
//   //   this.fileName = file.name;

//   //   const reader = new FileReader();
//   //   reader.onload = () => {
//   //     this.preview = reader.result as string;
//   //   };
//   //   reader.readAsDataURL(file);
//   // }


//   onFileChange(event: any) {
//     const file = event.target.files[0];
//     if (!file) return;

//     this.fileName = file.name; // ✅ Capture only file name
//   }

//   openImageModal(image: string) {
//     this.selectedImage = image;

//     this.showImageModal = true; // ✅ Open modal

//   }
//   closeImageModal() {
//     this.selectedImage = null;

//     this.showImageModal = false; // ✅ Close modal

//   }

// closeModal(expenseForm?: NgForm) {
//   this.showModal = false;
//   if (expenseForm) {
//     expenseForm.resetForm(); // ✅ Clears Angular form state
//   }
// }

// resetForm(){
//   this.fileName = null; 
//   this.preview = null;  
// }

//   addExpense(form: NgForm) {
//     if (form.invalid) return;

//     const newEntry = {
//       ...form.value,
//       filename: this.fileName, 
//       preview: this.preview 

//     };

//     this.expenses.push(newEntry);
//     this.service.setentries(this.expenses);
//     this.closeModal();
//     form.resetForm();
//   }


//   review() {
//     this.router.navigate(['/expensereview']);
//   }

//   cancel() {
//     if (confirm('Clear all entries?')) {
//       this.expenses = [];
//     }
//   }
  

//   goBack(): void {
//     // this.location.back(); // ✅ Navigates to previous page
//     this.router.navigate(['']);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
@Component({
 selector: 'app-expense',
 standalone: true,
 imports: [CommonModule, FormsModule, ClarityModule],
 templateUrl: './expense.component.html',
 styleUrls: ['./expense.component.css']
})
export class ExpenseComponent  {
 constructor(
   private empService: EmployeeService,
   private router: Router,
   private location: Location
 ) {}
 personalData: any;
 showModal = false;
 expenses: any[] = [];
 today: string = new Date().toISOString().split('T')[0];
 fileName: string | null = null;
//  ngOnInit() {
//    // 🔥 GET employee from backend (via localStorage)
//   //  this.personalData = this.empService.getEmployee();
//  }
 openModal() {
   this.showModal = true;
 }
 closeModal(form?: NgForm) {
   this.showModal = false;
   if (form) {
     form.resetForm();
   }
   this.fileName = null;
 }
 onFileChange(event: any) {
   const file = event.target.files[0];
   if (!file) return;
   this.fileName = file.name;
 }
 addExpense(form: NgForm) {
   if (form.invalid) return;
   const newEntry = {
     ...form.value,
     filename: this.fileName
   };
   this.expenses.push(newEntry);
   this.closeModal(form);
 }
 review() {
   this.router.navigate(['/expensereview']);
 }
 cancel() {
   if (confirm('Clear all entries?')) {
     this.expenses = [];
   }
 }
 goBack(): void {
   this.router.navigate(['']);
 }
}