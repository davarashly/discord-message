export interface Message {
  channelId: string
  data: {
    content: string
    files: string[]
  }
  token: string
}
