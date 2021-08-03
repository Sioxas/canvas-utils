export function Message(content: string, time = 5000){
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('canvas-utils-message-container');
  const message = document.createElement('div');
  message.classList.add('canvas-utils-message');
  message.innerText = content;
  messageContainer.appendChild(message);
  setTimeout(()=>{
    message.classList.add('canvas-utils-message-active');
  }, 100);
  setTimeout(()=>{
    message.classList.remove('canvas-utils-message-active');
  }, time - 300);
  setTimeout(()=>{
    messageContainer.parentNode?.removeChild(messageContainer);
  }, time);
  return messageContainer;
}