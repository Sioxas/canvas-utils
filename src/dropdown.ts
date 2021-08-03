
export function Dropdown(x: number, y: number , options:(DropdownOption|DropdownSeparator)[]){
  const dropdownLayer = document.createElement('div');
  dropdownLayer.classList.add('canvas-utils-fullscreen-prevent-events');
  
  const container = document.createElement('ul');
  container.classList.add('canvas-utils-dropdown');
  container.append(...options.map(option => option.render()));
  const width = 120;
  const height = options.map(option => option.height).reduce((a, b) => a + b, 0) + 20;
  container.style.top = Math.min(y, window.innerHeight - height) + 'px';
  container.style.left = (x > window.innerWidth - width ? x - width : x) + 4 + 'px';

  dropdownLayer.append(container);
  document.body.appendChild(dropdownLayer);
  dropdownLayer.addEventListener('click',() => {
    document.body.removeChild(dropdownLayer);
  });
}

export class DropdownOption{

  public height = 24;

  constructor(
    private text: string, 
    private callback: () => void
  ){}

  public render(){
    const el = document.createElement('li');
    el.classList.add('canvas-utils-dropdown-option');
    el.innerText = this.text;
    el.onclick = this.callback;
    return el;
  }
}
export class DropdownSeparator{
  
  public height = 17;

  public render(){
    const el = document.createElement('li');
    el.classList.add('canvas-utils-dropdown-separator');
    const line = document.createElement('div');
    line.classList.add('canvas-utils-dropdown-separator-line');
    el.append(line);
    return el;
  }
}


