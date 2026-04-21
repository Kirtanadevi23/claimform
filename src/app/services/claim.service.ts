
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class ClaimService {
  private baseUrl = 'https://localhost:7223/api/Claim';
  constructor(private http: HttpClient) { }
  getClaims(employeeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/employee/${employeeId}`);
  }
  getClaimsByEmployeeId(employeeId: string): Observable<any> {
    return this.getClaims(employeeId);
  }
  createClaim(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
  submitClaim(claimId: string, currentUser?: string) {
    return this.http.put(`${this.baseUrl}/submit/${claimId}?currentUser=${currentUser || ''}`, {});
  }
  getClaimById(claimId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${claimId}`);
  }
  withdrawClaim(claimId: string, currentUser?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/withdraw/${claimId}?currentUser=${currentUser || ''}`, {});
  }
}
