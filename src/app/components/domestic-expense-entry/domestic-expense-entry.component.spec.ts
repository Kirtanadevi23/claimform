import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Domesticform1Component } from './domesticform1.component';

describe('Domesticform1Component', () => {
  let component: Domesticform1Component;
  let fixture: ComponentFixture<Domesticform1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Domesticform1Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Domesticform1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
