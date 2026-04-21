import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-intro-overlay',
  standalone: true,
  imports: [],
  templateUrl: './intro-overlay.component.html',
  styleUrl: './intro-overlay.component.scss',
})
export class IntroOverlayComponent implements AfterViewInit, OnDestroy {
  @ViewChild('veil')      veilRef!:      ElementRef<HTMLElement>;
  @ViewChild('textStage') textStageRef!: ElementRef<HTMLElement>;
  @ViewChild('line1')     line1Ref!:     ElementRef<HTMLElement>;
  @ViewChild('line2')     line2Ref!:     ElementRef<HTMLElement>;
  @ViewChild('ornament')  ornRef!:       ElementRef<HTMLElement>;
  @ViewChild('bloom')     bloomRef!:     ElementRef<HTMLElement>;

  done = false;
  private tl!: gsap.core.Timeline;

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.buildTimeline());
  }

  private buildTimeline(): void {
    const veil      = this.veilRef.nativeElement;
    const textStage = this.textStageRef.nativeElement;
    const l1        = this.line1Ref.nativeElement;
    const l2        = this.line2Ref.nativeElement;
    const orn       = this.ornRef.nativeElement;
    const bloom     = this.bloomRef.nativeElement;

    // Initial hidden state
    gsap.set([l1, l2], { opacity: 0, y: 22 });
    gsap.set(orn,       { opacity: 0, scaleX: 0, transformOrigin: 'center center' });
    gsap.set(bloom,     { opacity: 0, scale: 0,  transformOrigin: 'center center' });

    this.tl = gsap.timeline({
      onComplete: () =>
        this.ngZone.run(() => {
          this.done = true;
          this.cdr.detectChanges();
        }),
    })
      // ── Phase 1: text enters ──────────────────────────────────────────────
      .to(l1,  { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },    0.5)
      .to(l2,  { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },    1.1)
      .to(orn, { opacity: 1, scaleX: 1, duration: 0.9, ease: 'power2.out' }, 1.6)

      // ── Phase 2: text + glass card exit ───────────────────────────────────
      .to([l1, l2, orn], { opacity: 0, duration: 0.65, ease: 'power2.in' },  2.7)
      .to(textStage,     { opacity: 0, duration: 0.5,  ease: 'power2.in' },  2.75)

      // ── Phase 3: pearl bloom reveals scene ───────────────────────────────
      .to(bloom, { opacity: 1, scale: 6, duration: 2.0, ease: 'expo.out' }, 3.3)
      .to(veil,  { opacity: 0, duration: 1.4, ease: 'power2.inOut' },       3.5);
  }

  ngOnDestroy(): void {
    this.tl?.kill();
  }
}
