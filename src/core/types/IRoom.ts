export interface IRoom {
  author: string
  roomName: string
  url: string
  currentTime: number
  isPlaying: boolean
  watchers: number
  thumbnail: string
  id: string
}

export interface IRoomPayload extends Pick<IRoom, "roomName" | "url" | "thumbnail"> {}

export interface DB {
  [nickName: string]: {
    rooms: Record<IRoom["id"], IRoom>
    hash: string
  }
}
