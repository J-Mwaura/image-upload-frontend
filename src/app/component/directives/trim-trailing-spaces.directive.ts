import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTrimTrailingSpaces]'
})
export class TrimTrailingSpacesDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    // Remove trailing spaces only (preserve leading spaces)
    input.value = input.value.replace(/\s+$/, '');
    
    // Restore cursor position
    input.setSelectionRange(start, end);
    input.dispatchEvent(new Event('input'));
  }

  @HostListener('blur') onBlur() {
    const input = this.el.nativeElement;
    // Final cleanup on blur
    input.value = input.value.replace(/\s+$/, '');
    input.dispatchEvent(new Event('input'));
  }
}