export class WebSocketPair {
  socket: WebSocket;
  response: Response;

  constructor() {
    const { socket, response } = Object.assign(new TransformStream(), {
      socket: null as unknown as WebSocket,
      response: null as unknown as Response,
    });
    
    this.socket = socket as WebSocket;
    this.response = response;
  }
}