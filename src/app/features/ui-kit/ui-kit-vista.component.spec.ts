import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { UiKitVistaComponent } from './ui-kit-vista.component';

describe('UiKitVistaComponent', () => {
  let temaPrevio: string | null;

  const crear = (selector: string, tema: string | null) => {
    TestBed.configureTestingModule({
      imports: [UiKitVistaComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ selector })),
            snapshot: { queryParamMap: convertToParamMap(tema ? { tema } : {}) },
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(UiKitVistaComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => (temaPrevio = document.documentElement.getAttribute('data-theme')));
  afterEach(() => document.documentElement.setAttribute('data-theme', temaPrevio ?? 'light'));

  it('pinta solo el ejemplo del selector, sin peticiones HTTP', () => {
    const fixture = crear('siaf-navbar', 'light');
    expect(fixture.nativeElement.querySelector('siaf-navbar')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('siaf-ui-kit-ficha')).toBeNull();
    TestBed.inject(HttpTestingController).verify();
  });

  it('aplica el tema que llega por la URL sin guardarlo como preferencia', () => {
    const guardado = localStorage.getItem('siaf-theme');
    crear('siaf-button', 'dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('siaf-theme')).toBe(guardado);
  });

  it('avisa si el selector no tiene ejemplo', () => {
    const fixture = crear('siaf-no-existe', null);
    expect(fixture.nativeElement.textContent).toContain('No hay ejemplo para «siaf-no-existe»');
  });
});
