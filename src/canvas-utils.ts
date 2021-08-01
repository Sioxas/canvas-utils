import './style.css'

export abstract class FreeCanvas{
  public ctx: FreeCanvasContext2D;

  public canvasOrigin = { x:0, y:0 };

  public canvasSize = { width:0, height:0 };

  private canvasScale = 1;

  private canvasDrag = false;

  constructor(private canvas:HTMLCanvasElement){
    this.ctx = new FreeCanvasContext2D(this,canvas.getContext('2d')!);
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        this.canvasSize = { width, height };
        this.canvas.width = width * devicePixelRatio;
        this.canvas.height = height * devicePixelRatio;
        this.move();
      }
    });
    resizeObserver.observe(this.canvas);

    this.canvas.addEventListener('mousedown',(event)=>{
      if(event.buttons === 4){
        this.beginDrag();
      }
    });
    
    this.canvas.addEventListener('mouseup',()=>this.stopDrag());
    
    this.canvas.addEventListener('mouseleave',()=>this.stopDrag());
    
    this.canvas.addEventListener('mousemove',(event)=>{
      if(!this.canvasDrag) return;
      this.canvasOrigin = {
        x: (event.movementX / this.canvasScale) + this.canvasOrigin.x,
        y: (event.movementY / this.canvasScale) + this.canvasOrigin.y
      };
    });
    
    this.canvas.addEventListener('wheel',(event)=>{
      event.preventDefault();
      if(event.ctrlKey){ // zoom
        const isTrackPad = Math.abs(event.deltaY) < 100; 
        const scale = 1 - event.deltaY * (isTrackPad ? 0.01 : 0.001);
        this.canvasScale *= scale;
        this.canvasOrigin.x += event.offsetX*devicePixelRatio*(1 - scale)/this.canvasScale;
        this.canvasOrigin.y += event.offsetY*devicePixelRatio*(1 - scale)/this.canvasScale;
      }else{
        this.canvasOrigin.x -= event.deltaX*devicePixelRatio/this.canvasScale;
        this.canvasOrigin.y -= event.deltaY*devicePixelRatio/this.canvasScale;
      }
      requestAnimationFrame(()=>this.drawContent());
    });
  }

  public abstract render():void;

  private drawContent(){
    this.ctx.restore();
    this.ctx.clear();
    this.ctx.save();
    this.ctx.scale(this.canvasScale, this.canvasScale);
    this.render();
  }

  private move(){
    this.drawContent();
    if(this.canvasDrag)
      requestAnimationFrame(()=>this.move());
  }

  private beginDrag(){
    this.canvas.classList.add('drag-cursor');
    this.canvasDrag = true;
    this.move();
  }

  private stopDrag(){
    this.canvasDrag = false;
    this.canvas.classList.remove('drag-cursor');
  }
}

class FreeCanvasContext2D {
  public constructor(private freeCanvas:FreeCanvas,private ctx:CanvasRenderingContext2D){
  }

  public fillStyle(color: string | CanvasGradient | CanvasPattern){
    this.ctx.fillStyle = color;
  }

  public fillRect(x:number,y:number,w:number,h:number){
    this.ctx.fillRect(
      x*devicePixelRatio+this.freeCanvas.canvasOrigin.x,
      y*devicePixelRatio+this.freeCanvas.canvasOrigin.y,
      w*devicePixelRatio,
      h*devicePixelRatio,
    );
  }

  public rect(x:number,y:number,w:number,h:number){
    this.ctx.rect(
      x*devicePixelRatio+this.freeCanvas.canvasOrigin.x,
      y*devicePixelRatio+this.freeCanvas.canvasOrigin.y,
      w*devicePixelRatio,
      h*devicePixelRatio,
    );
  }

  public restore(){
    this.ctx.restore();
  }

  public save(){
    this.ctx.save();
  }

  public scale(x:number,y:number){
    this.ctx.scale(x,y);
  }
  public clear(){
    this.ctx.clearRect(0,0,this.freeCanvas.canvasSize.width * devicePixelRatio, this.freeCanvas.canvasSize.height * devicePixelRatio);
  }
}