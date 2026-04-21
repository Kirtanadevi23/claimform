import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TempDataService {
  // Claim Metadata
  claimId: string | null = null;
  employeeData: any = null;
  claimDetails: any = null;
  viewOnly: boolean = false; 
  isViewMode: boolean = false;
  isEditMode: boolean = false;


  // --- DOMESTIC ---
  domesticTravelDetails = {
    selectedCurrency: 'INR',
    travelStart: '',
    travelEnd: '',
    numberOfDays: 0
  };
  cardEntries: any[] = [];
  cashEntries: any[] = [];
  expenseEntries: any[] = [];

  // Deletion Queues (Record IDs of existing items removed locally)
  domesticCardDeletes: string[] = [];
  domesticCashDeletes: string[] = [];
  domesticExpenseDeletes: string[] = [];

  // --- INTERNATIONAL ---
  intlTravelDetails = {
    selectedCurrency: 'INR',
    inrRate: 1.0,           // Exchange rate for conversion
    travelStart: '',
    travelEnd: '',
    numberOfDays: 0
  };
  intlCardEntries: any[] = [];
  intlCashEntries: any[] = [];
  intlExpenseEntries: any[] = [];

  intlCardDeletes: string[] = [];
  intlCashDeletes: string[] = [];
  intlExpenseDeletes: string[] = [];

  // --- GENERAL ---
  generalExpenseEntries: any[] = [];
  generalExpenseDeletes: string[] = [];

  constructor() { }

  /**
   * Reset the service state (call after final submission)
   */
  clearState() {
    this.claimId = null;
    this.employeeData = null;
    this.claimDetails = null;
    this.viewOnly = false;

    
    // Clear Domestic
    this.domesticTravelDetails = { selectedCurrency: 'INR', travelStart: '', travelEnd: '', numberOfDays: 0 };
    this.cardEntries = [];
    this.cashEntries = [];
    this.expenseEntries = [];
    this.domesticCardDeletes = [];
    this.domesticCashDeletes = [];
    this.domesticExpenseDeletes = [];

    // Clear International
    this.intlTravelDetails = { selectedCurrency: 'INR', inrRate: 1.0, travelStart: '', travelEnd: '', numberOfDays: 0 };
    this.intlCardEntries = [];
    this.intlCashEntries = [];
    this.intlExpenseEntries = [];
    this.intlCardDeletes = [];
    this.intlCashDeletes = [];
    this.intlExpenseDeletes = [];

    // Clear General
    this.generalExpenseEntries = [];
    this.generalExpenseDeletes = [];
  }
}
