export * from "./IRoom"
export * from "./JwtPayload"

export interface IUserData {
  nickname: string
}

export type DeepNestedObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any | DeepNestedObject
}
