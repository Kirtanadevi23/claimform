import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
    providedIn: 'root' // makes service available globally
})
export class ToastService {
    // Subject → used to send data from one component to another
    private toastSubject = new Subject<any>();
    // Observable → components will subscribe to this to receive toast messages
    toastState$ = this.toastSubject.asObservable();
    // Method to trigger toast
    show(message: string, type: 'success' | 'danger' | 'info' = 'info') {
        this.toastSubject.next({ message, type });
    }
}