export interface IMessage {
  channelId: string
  data: {
    content: string
    files?: string[]
  }
}

export interface DB {
  [nickName: string]: {
    posts: IMessage[]
    hash: string
    token: string
  }
}
