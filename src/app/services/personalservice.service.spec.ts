import { TestBed } from '@angular/core/testing';

import { PersonalserviceService } from './personalservice.service';

describe('PersonalserviceService', () => {
  let service: PersonalserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
