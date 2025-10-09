import { Component,OnInit } from '@angular/core';
import { PersonalserviceService } from '../../personalservice.service';
import { ClarityIcons } from '@cds/core/icon';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-expensereview',
  standalone: true,
  imports: [ClarityModule,FormsModule,CommonModule],
  templateUrl: './expensereview.component.html',
  styleUrl: './expensereview.component.css'
})
export class ExpensereviewComponent implements OnInit {
 expenses: any[] = [];
personalData:any;
constructor(private service:PersonalserviceService, private router:Router){}
  ngOnInit(): void {
this.personalData=this.service.getDetails();
this.expenses=this.service.getentries();
console.log(this.personalData);
console.log(this.expenses);
  }
  
  printPage() {
    window.print(); 
  }

  submitToMain() {
  this.service.setentries(this.expenses); // Save all entries
  this.router.navigate(['']); // Navigate back to main page
}
cancelPage() {
  this.router.navigate(['']); 
}
}

       