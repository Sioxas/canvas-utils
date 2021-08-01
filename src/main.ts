import { FreeCanvas } from "./canvas-utils";

const blockWidth = 10;
const blockHeight = 10;
const gap = 1;

const contentWidth = 1000;
const contentHeight = 1000;

const pX = blockWidth + gap;
const pY = blockHeight + gap;
const columns = contentWidth / pX | 0;
const rows = contentHeight / pY | 0;
const blocks = columns * rows;

class AppCanvas extends FreeCanvas{
  render(){
    for(let i = 0;i < rows; i++){
      const R = i/rows*255|0;
      for(let j = 0;j<columns;j++){
        const B = j/columns*255|0;
        const G = (i*rows+j)/blocks*255|0;
        this.ctx.fillStyle(`rgb(${R},${G},${B})`);
        this.ctx.fillRect(j*pX, i*pY, blockWidth, blockHeight);
      }
    }
  }
}

const root = document.querySelector<HTMLCanvasElement>('#app')!;
new AppCanvas(root);