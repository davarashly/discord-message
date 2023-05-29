import { Client, Intents, TextChannel } from "discord.js-user-account"
import logger from "./logger"

export class DiscordService {
  async sendMessage(token: string, channelId: string, content: string, files: string[]) {
    const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES], loginAsUserAccount: true })

    const messageResult = new Promise<boolean>((resolve, reject) => {
      client.on("ready", async (client) => {
        const channel = client.channels.cache.get(channelId) as TextChannel
        try {
          await channel.send({ files: files?.filter((f) => !!f), content })
          logger.log(`Message was sent as a user '${client.user.tag}' to the channel '${channel.name}': ${content}`)
          resolve(true)
        } catch (e: any) {
          logger.error(`Failed to send the message: ${e.message}`)
          reject(e)
        }
      })
    })

    try {
      await client.login(token)
      return messageResult
    } catch (e: any) {
      logger.error(`Failed to login with the token: ${e.message}`)
      throw e
    }
  }
}
