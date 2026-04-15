import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { ToastService } from './toast.service';
@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule, ClarityModule], // Clarity used here
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
    message = '';              // stores message text
    show = false;             // controls visibility
    type: any = 'info';       // success / danger / info
    constructor(private toastService: ToastService) { }
    ngOnInit(): void {
        // Subscribe to service → whenever show() is called anywhere
        this.toastService.toastState$.subscribe((data) => {
            this.message = data.message;  // set message
            this.type = data.type;        // set type (color)
            this.show = true;             // show toast
            // Auto-hide after 3 seconds
            setTimeout(() => {
                this.show = false;
            }, 3000);
        });
    }
}