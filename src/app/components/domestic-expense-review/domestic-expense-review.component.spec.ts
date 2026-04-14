import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomesticreviewComponent } from './domesticreview.component';

describe('DomesticreviewComponent', () => {
  let component: DomesticreviewComponent;
  let fixture: ComponentFixture<DomesticreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomesticreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DomesticreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
