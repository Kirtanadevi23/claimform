import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternationalreviewComponent } from './internationalreview.component';

describe('InternationalreviewComponent', () => {
  let component: InternationalreviewComponent;
  let fixture: ComponentFixture<InternationalreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternationalreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InternationalreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
