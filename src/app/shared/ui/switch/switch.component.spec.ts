import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';

import { SwitchComponent } from './switch.component';

describe('SwitchComponent', () => {
  let fixture: ComponentFixture<SwitchComponent>;
  const input = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const thumb = (): HTMLElement => fixture.nativeElement.querySelector('[aria-hidden="true"] > span');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SwitchComponent] }).compileComponents();
    fixture = TestBed.createComponent(SwitchComponent);
    fixture.componentRef.setInput('label', 'Notificar por correo');
    fixture.detectChanges();
  });

  it('al pulsarlo cambia de estado, mueve el círculo y avisa', () => {
    const emitidos: boolean[] = [];
    fixture.componentInstance.checkedChange.subscribe((v) => emitidos.push(v));
    expect(thumb().classList).toContain('translate-x-[2px]');

    input().click();
    fixture.detectChanges();

    expect(input().checked).toBeTrue();
    expect(input().getAttribute('aria-checked')).toBe('true');
    expect(thumb().classList).toContain('translate-x-[22px]');
    expect(thumb().classList).not.toContain('translate-x-[2px]');
    expect(emitidos).toEqual([true]);
  });

  it('el círculo y el riel tienen transición', () => {
    expect(thumb().classList).toContain('transition-transform');
    expect(thumb().parentElement!.classList).toContain('transition-colors');
    expect(input().getAttribute('role')).toBe('switch');
  });

  it('deshabilitado no cambia al pulsarlo', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    input().click();
    fixture.detectChanges();

    expect(input().checked).toBeFalse();
    expect(thumb().classList).toContain('translate-x-[2px]');
  });

  it('funciona con formControl', () => {
    @Component({
      standalone: true,
      imports: [ReactiveFormsModule, SwitchComponent],
      template: `<siaf-switch label="Activo" [formControl]="control" />`,
    })
    class AnfitrionComponent {
      readonly control = new FormControl(true, { nonNullable: true });
    }

    const anfitrion = TestBed.createComponent(AnfitrionComponent);
    anfitrion.detectChanges();
    const nativo: HTMLInputElement = anfitrion.nativeElement.querySelector('input');
    expect(nativo.checked).toBeTrue();

    nativo.click();
    anfitrion.detectChanges();
    expect(anfitrion.componentInstance.control.value).toBeFalse();
  });
});
