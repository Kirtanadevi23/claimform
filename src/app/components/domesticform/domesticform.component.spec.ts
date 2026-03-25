import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomesticformComponent } from './domesticform.component';

describe('DomesticformComponent', () => {
  let component: DomesticformComponent;
  let fixture: ComponentFixture<DomesticformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomesticformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DomesticformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
