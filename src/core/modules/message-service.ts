import * as fs from "fs/promises"
import { jsonCleanComments, pathResolve } from "../utils"
import { IRoom, DB } from "../types"

// Singleton WriteQueue class for managing write operations
class WriteQueue {
  private static instance: WriteQueue
  private queue: (() => Promise<void>)[] = []
  private isWriting = false

  private constructor() {}

  static getInstance(): WriteQueue {
    if (!WriteQueue.instance) {
      WriteQueue.instance = new WriteQueue()
    }
    return WriteQueue.instance
  }

  async add(writeFunction: () => Promise<void>) {
    this.queue.push(writeFunction)
    if (!this.isWriting) {
      this.isWriting = true
      while (this.queue.length > 0) {
        const write = this.queue.shift()!
        await write()
      }
      this.isWriting = false
    }
  }
}

// Singleton DBService class
export class DBService {
  private static instance: DBService | null = null

  get DB(): DB {
    return this._DB
  }

  private _DB: DB
  private writeQueue = WriteQueue.getInstance() // Use shared WriteQueue

  // Private constructor to prevent direct instantiation
  private constructor() {
    this._DB = {}
  }

  static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService()
    }

    return DBService.instance
  }

  // Load the DB from a file
  async getDB() {
    const dbFile = await fs.readFile(pathResolve(process.cwd(), "config", "DB.json"))
    this._DB = jsonCleanComments(dbFile.toString())
  }

  async writeFile(data: DB) {
    await this.writeQueue.add(async () => {
      await fs.writeFile(pathResolve(process.cwd(), "config", "DB.json"), JSON.stringify(data, null, 2))
    })
  }

  private async modifyDB(modification: (db: DB) => void) {
    await this.getDB()
    modification(this.DB)
    await this.writeFile(this.DB)
  }

  async getRooms(nickname: keyof DB): Promise<IRoom[]> {
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error(`No record found for nickname: ${nickname}`)
    }

    return Object.values(this.DB[nickname].rooms) ?? []
  }

  async getRoom(nickname: keyof DB, author: string, id: string): Promise<IRoom> {
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error(`No record found for nickname: ${nickname}`)
    }

    if (!this.DB[author]) {
      throw new Error(`No record found for author: ${author}`)
    }

    if (!this.DB[author].rooms[id]) {
      throw new Error(`Room with ID: ${id} not found`)
    }

    return this.DB[author].rooms[id]
  }

  async incrementRoomWatchersCount(nickname: keyof DB, id: string) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].rooms) {
        db[nickname].rooms = {}
      }

      if (!db[nickname].rooms[id]) {
        throw new Error(`Room with ID: ${id} not found`)
      }

      db[nickname].rooms[id].watchers++
    }

    return await this.modifyDB(handler).then(() => this.DB[nickname].rooms[id])
  }

  async decrementRoomWatchersCount(nickname: keyof DB, id: string) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].rooms) {
        db[nickname].rooms = {}
      }

      if (!db[nickname].rooms[id]) {
        throw new Error(`Room with ID: ${id} not found`)
      }

      db[nickname].rooms[id].watchers--
    }

    await this.modifyDB(handler)
  }

  async updateRoom(nickname: keyof DB, room: IRoom, id: string) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].rooms) {
        db[nickname].rooms = {}
      }

      db[nickname].rooms[id] = room
    }

    await this.modifyDB(handler)
  }

  async updateRoomPlayback(
    nickname: keyof DB,
    { isPlaying, currentTime }: Pick<IRoom, "isPlaying" | "currentTime">,
    id: string
  ) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].rooms) {
        db[nickname].rooms = {}
      }

      db[nickname].rooms[id].isPlaying = isPlaying
      db[nickname].rooms[id].currentTime = currentTime
    }

    await this.modifyDB(handler)
  }

  async swapRooms(nickname: keyof DB, roomIdx: number, roomIdx2: number) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].rooms?.[roomIdx] || !db[nickname].rooms?.[roomIdx2]) {
        throw new Error(`Invalid room indexes`)
      }

      const tmp = db[nickname].rooms[roomIdx]
      db[nickname].rooms[roomIdx] = db[nickname].rooms[roomIdx2]
      db[nickname].rooms[roomIdx2] = tmp
    }

    await this.modifyDB(handler)
  }

  async createRoom(nickname: keyof DB, room: IRoom) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].rooms) {
        db[nickname].rooms = {}
      }

      db[nickname].rooms[room.id] = room
    }

    await this.modifyDB(handler)
  }

  async deleteRoom(nickname: keyof DB, id: string) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].rooms) {
        throw new Error(`No rooms found for nickname: ${nickname}`)
      }

      delete db[nickname].rooms[id]
    }

    await this.modifyDB(handler)
  }
}
