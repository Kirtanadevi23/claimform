import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensereviewComponent } from './expensereview.component';

describe('ExpensereviewComponent', () => {
  let component: ExpensereviewComponent;
  let fixture: ComponentFixture<ExpensereviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensereviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpensereviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
