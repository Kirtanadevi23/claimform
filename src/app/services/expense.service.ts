import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ExpenseService {
  private baseUrl = 'https://localhost:7223/api/Expense';
  constructor(private http: HttpClient) {}
  addExpense(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  getExpenses(claimId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${claimId}`);
  }
}
 