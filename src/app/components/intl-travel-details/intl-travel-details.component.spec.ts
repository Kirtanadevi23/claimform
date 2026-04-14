import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternationalformComponent } from './internationalform.component';

describe('InternationalformComponent', () => {
  let component: InternationalformComponent;
  let fixture: ComponentFixture<InternationalformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternationalformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InternationalformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
