import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoiceUrlsComponent } from './choice-urls.component';

describe('ChoiceUrlsComponent', () => {
  let component: ChoiceUrlsComponent;
  let fixture: ComponentFixture<ChoiceUrlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceUrlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChoiceUrlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
