// PURPOSE:
// This service connects Angular frontend with Expense API backend.
// Handles:
// - Add Expense (POST)
// - Get Expenses by ClaimId (GET)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  // ✅ API BASE URL
  private apiUrl = 'https://localhost:7223/api/Expense';
  constructor(private http: HttpClient) { }
  // ✅ ADD EXPENSE → POST API
  addExpense(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  // ✅ GET EXPENSES BY CLAIM ID → GET API
  getExpensesByClaimId(claimId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${claimId}`);
  }
  // UPDATE
  updateExpense(expenseId: string, data: any) {
    return this.http.put(`${this.apiUrl}/${expenseId}`, data);
  }
  // DELETE
  deleteExpense(expenseId: string) {
    return this.http.delete(`${this.apiUrl}/${expenseId}`);
  }
}

