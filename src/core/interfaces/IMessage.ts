type Status = "fail" | "success" | "n/a"

export interface IMessage {
  channelId: string
  data: {
    content: string
    files?: string[]
  }
  status: Status
}

export interface DB {
  [nickName: string]: {
    posts: IMessage[]
    hash: string
    token: string
  }
}
