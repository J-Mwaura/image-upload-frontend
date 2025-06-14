import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appLowercaseTrim]',
  standalone: true
})
export class LowercaseTrimDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;
    input.value = input.value.toLowerCase().trim();
    input.setSelectionRange(cursorPosition, cursorPosition);
    input.dispatchEvent(new Event('input'));
  }

  @HostListener('blur', ['$event']) onBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.trim();
    input.dispatchEvent(new Event('input'));
  }
}