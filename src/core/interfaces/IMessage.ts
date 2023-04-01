export type Status = "fail" | "success" | "n/a"

export interface IMessage {
  active: boolean
  channelId: string
  data: {
    content: string
    files?: string[]
  }
  status: Status
  token?: string
}

export interface DB {
  [nickName: string]: {
    posts: IMessage[]
    hash: string
    token: string
  }
}
