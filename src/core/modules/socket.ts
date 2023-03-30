import { Server as HttpServer } from "http"
import { Server as SocketServer } from "socket.io"

export default class SocketMgr {
  private io: SocketServer

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer)
  }

  broadcast(event: "info" | "error", msg: string) {
    this.io.emit(event, msg + "\n")
  }
}
