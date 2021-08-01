import './style.css'

const appCanvas = document.querySelector<HTMLCanvasElement>('#app')!;
const ctx = appCanvas.getContext('2d')!;

const resizeObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    appCanvas.width = width * devicePixelRatio;
    appCanvas.height = height * devicePixelRatio;
    move();
  }
});
resizeObserver.observe(document.body);

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

let canvasOrigin = { x:0, y:0 };
let canvasScale = 1;
let canvasDrag = false;

function drawContent(){
  ctx.restore();
  ctx.clearRect(0,0,appCanvas.width, appCanvas.height);
  ctx.save();
  ctx.scale(canvasScale, canvasScale);
  for(let i = 0;i < rows; i++){
    const R = i/rows*255|0;
    for(let j = 0;j<columns;j++){
      const B = j/columns*255|0;
      const G = (i*rows+j)/blocks*255|0;
      ctx.fillStyle = `rgb(${R},${G},${B})`;
      ctx.fillRect(
        j*pX*devicePixelRatio + canvasOrigin.x, 
        i*pY*devicePixelRatio + canvasOrigin.y, 
        blockWidth*devicePixelRatio, 
        blockHeight*devicePixelRatio
      );
    }
  }
}

function move(){
  // console.log(offset, dragEnd);
  drawContent();
  if(canvasDrag)
    requestAnimationFrame(move);
}

function beginDrag(){
  appCanvas.classList.add('drag-cursor');
  canvasDrag = true;
  move();
}

function stopDrag(){
  canvasDrag = false;
  appCanvas.classList.remove('drag-cursor');
}

appCanvas.addEventListener('mousedown',(event)=>{
  if(event.buttons === 4){
    beginDrag();
  }
});

appCanvas.addEventListener('mouseup',stopDrag);

appCanvas.addEventListener('mouseleave',stopDrag);

appCanvas.addEventListener('mousemove',(event)=>{
  if(!canvasDrag) return;
  canvasOrigin = {
    x: (event.movementX / canvasScale) + canvasOrigin.x,
    y: (event.movementY / canvasScale) + canvasOrigin.y
  };
});

appCanvas.addEventListener('wheel',(event)=>{
  event.preventDefault();
  if(event.ctrlKey){ // zoom
    const isTrackPad = Math.abs(event.deltaY) < 100; 
    const scale = 1 - event.deltaY * (isTrackPad ? 0.01 : 0.001);
    canvasScale *= scale;
    canvasOrigin.x += event.offsetX*devicePixelRatio*(1 - scale)/canvasScale;
    canvasOrigin.y += event.offsetY*devicePixelRatio*(1 - scale)/canvasScale;
  }else{
    canvasOrigin.x -= event.deltaX*devicePixelRatio/canvasScale;
    canvasOrigin.y -= event.deltaY*devicePixelRatio/canvasScale;
  }
  requestAnimationFrame(drawContent);
});