import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
 providedIn: 'root'
})
export class CardcashService {
 private baseUrl = 'https://localhost:7223/api/cardcash';
 constructor(private http: HttpClient) {}
 /**
  * Add Card or Cash entry
  */
 addCardCash(data: any): Observable<any> {
   return this.http.post(`${this.baseUrl}`, data);
 }
 /**
  * Update entry
  */
 updateCardCash(id: string, data: any): Observable<any> {
   return this.http.put(`${this.baseUrl}/${id}`, data);
 }
 /**
  * Delete entry
  */
 deleteCardCash(id: string): Observable<any> {
   return this.http.delete(`${this.baseUrl}/${id}`);
 }
 /**
  * Get by ClaimId
  */
 getByClaimId(claimId: string): Observable<any> {
   return this.http.get(`${this.baseUrl}/${claimId}`);
 }
}