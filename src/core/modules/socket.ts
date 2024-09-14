import { Server as HttpServer } from "http"
import { Server as SocketServer, Socket } from "socket.io"
import { DBService } from "./message-service"

export default class SocketMgr {
  private io: SocketServer
  private db: DBService

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer)
    this.db = DBService.getInstance()

    this.io.on("connection", (socket: Socket) => {
      // console.log(`User connected: ${socket.id}`)

      socket.on("join-room", async ({ author, id }: { author: string; id: string }) => {
        const room = await this.db.incrementRoomWatchersCount(author, id)

        socket.join(id)

        socket.emit("video-update", { isPlaying: room.isPlaying, currentTime: room.currentTime })
      })

      socket.on("leave-room", async ({ author, id }: { author: string; id: string }) => {
        socket.leave(id)

        await this.db.decrementRoomWatchersCount(author, id)
      })

      socket.on(
        "video-update",
        async ({
          author,
          isPlaying,
          currentTime,
          id,
        }: {
          author: string
          id: string
          currentTime: number
          isPlaying: boolean
        }) => {
          socket.broadcast.emit("video-update", { isPlaying, currentTime })

          await this.db.updateRoomPlayback(author, { isPlaying, currentTime }, id)
        }
      )

      socket.on("disconnect", () => {
        // console.log(`User disconnected: ${socket.id}`)
      })
    })
  }
}
