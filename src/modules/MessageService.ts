import * as fs from "fs/promises"
import { hrsToMilliseconds, pathResolve } from "../utils"
import { Message } from "../interfaces/Message"
import { Client, Intents, TextChannel } from "discord.js-user-account"

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
    await this.getMessages()

    const handler = () => {
      for (const message of this.messages) {
        const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES], loginAsUserAccount: true })

        client.on("ready", (client) => {
          console.log(`Logged in as ${client.user.tag}`)

          const {
            channelId,
            data: { content, files }
          } = message

          const channel = client.channels.cache.get(channelId) as TextChannel

          channel
            .send({ files, content })
            .then(() => {
              console.group(client.user.tag)
              console.log("Message was sent!")
              console.log(message)
              console.groupEnd()
            })
            .catch((e) => console.error(e))
        })

        client.login(message.token)
      }

      setTimeout(handler, hrsToMilliseconds(0.51))
    }

    handler()
  }
}
