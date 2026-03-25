import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersonalserviceService {

    constructor() { }
 
 
private details: any = {};
private entries:any=[];
private expense:any=[];
 
 
 
  setDetails(data: any) {
    this.details = data;
  }
 
  getDetails() {
    return this.details;
  }
setentries(entries:any){
this.entries=entries
}
getentries(){
  return this.entries
}
setExpense(data: any)  {
 this.expense.push(data);
}
getExpense(){
  return this.expense
}
 
}
 
  

