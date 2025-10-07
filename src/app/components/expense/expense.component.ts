import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, Validators } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [FormsModule,CommonModule,ClarityModule],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css'
})
export class ExpenseComponent {
  constructor(private router:Router){}
username: string = '';
  editIndex: number | null = null;
  isEdit:boolean=false;
  formData: any = {
    date: '',
    supportingNo: '',
    particulars: '',
    paymentMode: 'Cash',
    amount: null,
    remarks: '',
    screenshot: ''
  };
 
  //expenseForm: FormGroup;
 
  entries: any[] = [];
 
    //     date: ['', Validators.required],
    //     supportingNo: ['', Validators.required],
    //     particulars: ['', Validators.required],
    //     paymentMode: ['', Validators.required],
    //     amount: ['', [Validators.required, Validators.min(1)]],
    //     remarks: ['']
    //   });
  
  personalData: any;
  ngOnInit() {
    
  }
 
  // onFileChange(event: any) {
  //     const file = event.target.files[0];
  //     if (file) {
  //       this.formData.screenshot = file.name; // You can store base64 if needed
  //     }
  //   }
 
  addEntry(form: NgForm) {
    debugger
 
    if (form.valid) {
      if (this.editIndex != null &&this.isEdit) {
 
        // Update existing entry
        this.entries[this.editIndex] = this.formData;
        this.editIndex = null;
        this.isEdit=false
 
      }
else{
  this.entries.push({ ...this.formData });
     
     
    }
     
      this.formopen = false
}
   
  }
  removeentry(index: number) {
    const of=confirm("are you sure")
    if(of){
this.entries.splice(index, 1)
    }
   
  }
  formopen: boolean = true;
  openmodel() {
    debugger
    this.formopen = true;
    this.isEdit=false;
    this.formData = {
        date: '',
        supportingNo: '',
        particulars: '',
        paymentMode: 'Cash',
        amount: null,
        remarks: '',
        screenshot: ''
      };
  }
 
  Editentry( entry: any,index: number) {
    debugger
    this.formData = ({ ...entry })
    this.editIndex = index;
    this.formopen = true
    this.isEdit=true;
   console.log("forms",this.formData);
   
 
  }
}
