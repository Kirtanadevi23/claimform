import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Internationalform1Component } from './internationalform1.component';

describe('Internationalform1Component', () => {
  let component: Internationalform1Component;
  let fixture: ComponentFixture<Internationalform1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Internationalform1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Internationalform1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
