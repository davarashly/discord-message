import * as fs from "fs/promises"
import { hrsToMilliseconds, jsonCleanComments, pathResolve } from "../utils"
import { DB, IMessage } from "../interfaces/IMessage"
import { DiscordService } from "./discord-service"

class WriteQueue {
  private queue: (() => Promise<void>)[] = []
  private isWriting = false

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

export class DBService {
  get DB(): DB {
    return this._DB
  }

  private _DB: DB
  private writeQueue = new WriteQueue()
  private discordService: DiscordService

  constructor() {
    this._DB = {}
    this.discordService = new DiscordService()
  }

  async getDB() {
    const dbFile = await fs.readFile(pathResolve(process.cwd(), "config", "DB.json"))

    this._DB = jsonCleanComments(dbFile.toString())
  }

  async processMessages() {
    async function handler(this: DBService) {
      await this.getDB()

      for (const nickname in this.DB) {
        for (let i = 0; i < this.DB[nickname].posts?.length; i++) {
          const post = this.DB[nickname].posts[i]

          if (!post.active) {
            continue
          }

          const {
            channelId,
            data: { content, files },
            token
          } = post

          const result = await this.discordService.sendMessage(token || this.DB[nickname].token, channelId, content, files || [])

          if (result) {
            post.status = "success"
            await this.updatePost(nickname, post, i)
          } else {
            post.status = "fail"
            await this.updatePost(nickname, post, i)
          }
        }
      }

      setTimeout(handler.bind(this), hrsToMilliseconds(0.51))
    }

    await handler.call(this)
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

  async setToken(nickname: keyof DB, token: string) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }
      db[nickname].token = token
    }

    await this.modifyDB(handler)
  }

  async getPosts(nickname: keyof DB): Promise<IMessage[]> {
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error()
    }

    return this.DB[nickname].posts
  }

  async getPost(nickname: keyof DB, idx: number): Promise<IMessage> {
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error()
    }

    return this.DB[nickname].posts?.[idx]
  }

  async updatePost(nickname: keyof DB, post: IMessage, idx: number) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].posts) {
        db[nickname].posts = []
      }

      if (!db[nickname].posts[idx]) {
        idx = db[nickname].posts.length
      }

      db[nickname].posts[idx] = post
    }

    await this.modifyDB(handler)
  }

  async swapPosts(nickname: keyof DB, postIdx: number, postIdx2: number) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].posts?.[postIdx] || !db[nickname].posts?.[postIdx2]) {
        return
      }

      const tmp = db[nickname].posts[postIdx]
      db[nickname].posts[postIdx] = db[nickname].posts[postIdx2]
      db[nickname].posts[postIdx2] = tmp
    }

    await this.modifyDB(handler)
  }

  async createPost(nickname: keyof DB, post: IMessage) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].posts) {
        db[nickname].posts = []
      }

      db[nickname].posts.push(post)
    }

    await this.modifyDB(handler)
  }

  async deletePost(nickname: keyof DB, idx: number) {
    const handler = (db: DB) => {
      if (!db[nickname]) {
        throw new Error(`No record found for nickname: ${nickname}`)
      }

      if (!db[nickname].posts) {
        db[nickname].posts = []
      }

      db[nickname].posts.splice(idx, 1)
    }

    await this.modifyDB(handler)
  }
}
