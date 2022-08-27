import * as fs from "fs/promises"
import { hrsToMilliseconds, pathResolve } from "../utils"
import { Message } from "../interfaces/Message"
import { Client, Intents, TextChannel } from "discord.js-user-account"
import logger from "./Logger"

export class MessageService {
  messages: Message[]

  constructor() {
    this.messages = []
  }

  async getMessages() {
    const messagesFile = await fs.readFile(pathResolve(process.cwd(), "config", "messages.json"))
    const messages: Message[] = JSON.parse(messagesFile.toString())

    this.messages = messages
  }

  async processMessages() {
    async function handler(this: MessageService) {
      await this.getMessages()

      for (const message of this.messages) {
        const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES], loginAsUserAccount: true })

        client.on("ready", (client) => {
          const {
            channelId,
            data: { content, files }
          } = message

          const channel = client.channels.cache.get(channelId) as TextChannel

          channel
            .send({ files, content })
            .then(() => {
              logger.log(`Message was sent as a user \`${client.user.tag}\` to the channel \`${channel.name}\`: ${content}`)
              console.log()
            })
            .catch((e) => logger.error(e))
        })

        client.login(message.token)
      }

      setTimeout(handler.bind(this), hrsToMilliseconds(0.51))
    }

    await handler.call(this)
  }
}
