import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Tab1Page } from './tab1.page';
import { CounterService } from '../services/counter.service';
import { SavedCounter } from '../models/saved-counter';

describe('Tab1Page', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  let counterServiceMock: any;

  beforeEach(() => {
    // Vytvoříme falešnou službu, abychom netestovali skutečný CounterService
    counterServiceMock = {
      add: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CounterService, useValue: counterServiceMock }
      ]
    });

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call CounterService.add when onSaved is triggered', () => {
    const mockCounter: SavedCounter = {
      id: 'test-id',
      name: 'Test',
      value: 5,
      createdAt: new Date().toISOString()
    };

    // Zavoláme metodu tak, jak by to udělala šablona
    component.onSaved(mockCounter);

    // Ověříme, že Tab1Page správně předal data službě
    expect(counterServiceMock.add).toHaveBeenCalledWith(mockCounter);
    expect(counterServiceMock.add).toHaveBeenCalledTimes(1);
  });
});