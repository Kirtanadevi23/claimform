import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'https://localhost:7223/api/Employee';
  constructor(private http: HttpClient) { }
  // LOGIN — sends email + password to backend
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
  // NEW — fetch employee details by ID from backend
  getEmployeeById(employeeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${employeeId}`);
  }
}