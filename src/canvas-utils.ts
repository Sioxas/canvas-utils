import { Tween, Easing, update } from '@tweenjs/tween.js';
import { Dropdown, DropdownOption, DropdownSeparator } from './dropdown';

import './canvas-utils.less'
import { Message } from './message';

export abstract class Stage {
  public ctx: StageContext2D;

  public origin = { x: 0, y: 0 };

  public size = { width: 0, height: 0 };

  private scale = 1;

  private drag = false;

  private zooming = false;

  public canvas: HTMLCanvasElement;

  constructor(private root: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('canvas-utils-stage');
    root.appendChild(this.canvas);
    this.ctx = new StageContext2D(this);
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        this.size = { width, height };
        this.canvas.width = width * devicePixelRatio;
        this.canvas.height = height * devicePixelRatio;
        this.move();
      }
    });
    resizeObserver.observe(this.canvas);

    this.canvas.addEventListener('mousedown', (event) => {
      if (event.buttons === 4) {
        this.beginDrag();
      }
    });

    this.canvas.addEventListener('mouseup', () => this.stopDrag());

    this.canvas.addEventListener('mouseleave', () => this.stopDrag());

    this.canvas.addEventListener('mousemove', (event) => {
      if (!this.drag) return;
      this.origin = {
        x: (event.movementX / this.scale) + this.origin.x,
        y: (event.movementY / this.scale) + this.origin.y
      };
    });

    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      if (this.drag) return;
      if (event.ctrlKey) { // zoom
        const isTrackPad = Math.abs(event.deltaY) < 100;
        const scale = 1 - event.deltaY * (isTrackPad ? 0.01 : 0.001);
        this.scale *= scale;
        const µ = devicePixelRatio * (1 - scale) / this.scale;
        this.origin.x += event.offsetX * µ;
        this.origin.y += event.offsetY * µ;
      } else {
        this.origin.x -= event.deltaX * devicePixelRatio / this.scale;
        this.origin.y -= event.deltaY * devicePixelRatio / this.scale;
      }
      requestAnimationFrame(() => this.drawContent());
    });

    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      Dropdown(event.clientX, event.clientY, [
        new DropdownOption('Zoom In', () => this.zoom(1.5, event)),
        new DropdownOption('Zoom Out', () => this.zoom(0.5, event)),
        new DropdownOption('Reposition', () => this.reposition()),
        new DropdownSeparator(),
        new DropdownOption('Copy as PNG', () => {
          this.canvas.toBlob(async (blob) => {
            if(blob){
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
              this.root.append(Message('Image copied to clipboard.'));
            } else {
              this.root.append(Message('Fail to copy image!'));
            }
          });
        }),
        new DropdownOption('Save as PNG', () => {
          const downloadLink = document.createElement('a');
          downloadLink.setAttribute('download', 'canvas-utils.png');
          this.canvas.toBlob(function (blob) {
            const url = URL.createObjectURL(blob);
            downloadLink.setAttribute('href', url);
            downloadLink.click();
          });
        }),
      ]);
    });
  }

  public abstract render(): void;

  public zoom(scale: number, event?: MouseEvent) {
    let x = this.size.width / 2,
      y = this.size.height / 2;
    if (event) {
      x = event.offsetX;
      y = event.offsetY;
    }
    this.zoomTo({ x, y }, scale * this.scale);
  }

  public reposition() {
    this.zooming = true;
    requestAnimationFrame(t => this.animate(t));
    let tween: Tween<{ x: number; y: number; } | { scale: number }>;
    if(this.scale === 1){
      tween = new Tween(this.origin)
        .to({ x: 0, y: 0 }, 300)
        .onUpdate(() => {
          this.drawContent();
        })
    } else {
      const initPos = { ...this.origin };
      const initScale = this.scale;
      const tweenProps = { scale: this.scale };
      tween = new Tween(tweenProps)
        .to({ scale: 1 }, 300)
        .onUpdate(() => {
          this.scale = tweenProps.scale;
          const µ = initScale * (this.scale - 1) / ((initScale - 1) * this.scale);
          this.origin.x = µ * initPos.x;
          this.origin.y = µ * initPos.y;
          this.drawContent();
        })
    }
    tween.easing(Easing.Quadratic.Out)
      .onComplete(() => {
        this.zooming = false;
      })
      .start();
  }

  private zoomTo(zoomOrigin: { x: number, y: number }, targetScale: number) {
    this.zooming = true;

    requestAnimationFrame(t => this.animate(t));

    const tweenProps = { scale: this.scale };

    new Tween(tweenProps)
      .to({ scale: targetScale }, 300)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        const scale = tweenProps.scale / this.scale;
        this.scale *= scale;
        const µ = devicePixelRatio * (1 - scale) / this.scale;
        this.origin.x += zoomOrigin.x * µ;
        this.origin.y += zoomOrigin.y * µ;
        this.drawContent();
      })
      .onComplete(() => {
        this.zooming = false;
      })
      .start();
  }

  private animate(time: number) {
    update(time);
    if (this.zooming)
      requestAnimationFrame((t) => this.animate(t));
  }

  private drawContent() {
    this.ctx.restore();
    this.ctx.clear();
    this.ctx.save();
    this.ctx.scale(this.scale, this.scale);
    this.render();
  }

  private move() {
    this.drawContent();
    if (this.drag)
      requestAnimationFrame(() => this.move());
  }

  private beginDrag() {
    this.canvas.classList.add('canvas-utils-stage-darg');
    this.drag = true;
    this.move();
  }

  private stopDrag() {
    this.drag = false;
    this.canvas.classList.remove('canvas-utils-stage-darg');
  }
}

class StageContext2D {
  private ctx: CanvasRenderingContext2D

  public constructor(private stage: Stage) {
    this.ctx = this.stage.canvas.getContext('2d')!;
  }

  public set fillStyle(color: string | CanvasGradient | CanvasPattern) {
    this.ctx.fillStyle = color;
  }

  public fillRect(x: number, y: number, w: number, h: number) {
    this.ctx.fillRect(
      x * devicePixelRatio + this.stage.origin.x,
      y * devicePixelRatio + this.stage.origin.y,
      w * devicePixelRatio,
      h * devicePixelRatio,
    );
  }

  public rect(x: number, y: number, w: number, h: number) {
    this.ctx.rect(
      x * devicePixelRatio + this.stage.origin.x,
      y * devicePixelRatio + this.stage.origin.y,
      w * devicePixelRatio,
      h * devicePixelRatio,
    );
  }

  public restore() {
    this.ctx.restore();
  }

  public save() {
    this.ctx.save();
  }

  public scale(x: number, y: number) {
    this.ctx.scale(x, y);
  }
  public clear() {
    this.ctx.clearRect(0, 0, this.stage.size.width * devicePixelRatio, this.stage.size.height * devicePixelRatio);
  }
}