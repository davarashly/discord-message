import * as fs from "fs/promises"
import { hrsToMilliseconds, jsonCleanComments, pathResolve } from "../utils"
import { DB, IMessage } from "../interfaces/IMessage"
import { Client, Intents, TextChannel } from "discord.js-user-account"
import logger from "./logger"

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

  constructor() {
    this._DB = {}
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

          const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES], loginAsUserAccount: true })

          const {
            channelId,
            data: { content, files },
            token
          } = post

          client.on("ready", (client) => {
            const channel = client.channels.cache.get(channelId) as TextChannel

            channel
              .send({ files: files?.filter((f) => !!f), content })
              .then(async () => {
                logger.log(`Message was sent as a user '${client.user.tag}' to the channel '${channel.name}': ${content}`)

                if (post.status !== "success") {
                  post.status = "success"
                  await this.updatePost(nickname, post, i)
                }
                console.log()
              })
              .catch(async (e) => {
                console.error(e)
                logger.error(e)
                if (post.status !== "fail") {
                  post.status = "fail"
                  await this.updatePost(nickname, post, i)
                }
              })
          })

          try {
            await client.login(token || this.DB[nickname].token)
          } catch (e) {
            logger.error(`\`${nickname}\` has invalid discord token.`)
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

  async setToken(nickname: keyof DB, token: string) {
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error()
    }

    this.DB[nickname].token = token

    await this.writeFile(this.DB)
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
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error()
    }

    if (!this.DB[nickname].posts) {
      this.DB[nickname].posts = []
    }

    if (!this.DB[nickname].posts[idx]) {
      idx = this.DB[nickname].posts.length
    }

    this.DB[nickname].posts[idx] = post

    await this.writeFile(this.DB)
  }

  async swapPosts(nickname: keyof DB, postIdx: number, postIdx2: number) {
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error()
    }

    if (!this.DB[nickname].posts?.[postIdx] || !this.DB[nickname].posts?.[postIdx2]) {
      return
    }

    const tmp = this.DB[nickname].posts[postIdx]

    this.DB[nickname].posts[postIdx] = this.DB[nickname].posts[postIdx2]
    this.DB[nickname].posts[postIdx2] = tmp

    await this.writeFile(this.DB)
  }

  async createPost(nickname: keyof DB, post: IMessage) {
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error()
    }

    if (!this.DB[nickname].posts) {
      this.DB[nickname].posts = []
    }

    this.DB[nickname].posts.push(post)

    await this.writeFile(this.DB)
  }

  async deletePost(nickname: keyof DB, idx: number) {
    await this.getDB()

    if (!this.DB[nickname]) {
      throw new Error()
    }

    if (!this.DB[nickname].posts) {
      this.DB[nickname].posts = []
    }

    this.DB[nickname].posts.splice(idx, 1)

    await this.writeFile(this.DB)
  }
}
