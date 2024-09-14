import { RequestListener } from "http"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { v7 as makeUUID } from "uuid"

import { getContentType, getBody, makeCookie, parseCookies, secretCode } from "../utils"
import { DBService } from "./message-service"
import { DeepNestedObject, IRoom, IRoomPayload, IUserData, JwtPayload } from "../types"

export const authController: RequestListener = async (req, res) => {
  try {
    const { username, password } = await getBody<{ username: string; password: string }>(req)

    if (!username || !password) {
      throw new Error("Username or password wasn't specified")
    }

    const dbService = DBService.getInstance()
    await dbService.getDB()

    for (const nickname in dbService.DB) {
      if (
        nickname.trim().toLowerCase() === username.trim().toLowerCase() &&
        (await bcrypt.compare(password, dbService.DB[nickname].hash))
      ) {
        const userData: IUserData = {
          nickname,
        }

        const token = jwt.sign(userData, secretCode, { expiresIn: "2d" })
        const cookies = [makeCookie("token", token), makeCookie("userData", JSON.stringify(userData), false)]

        res.setHeader("Set-Cookie", cookies)
        return res.end()
      }
    }

    throw new Error("User with this username and password wasn't found")
  } catch (error: unknown) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (error as DeepNestedObject).message.toString() }))
  }
}
export const getRoomsController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = jwt.verify(cookies.token, secretCode) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const dbService = DBService.getInstance()

    const rooms = await dbService.getRooms(nickname)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ rooms: rooms ?? [] }))
  } catch (error: unknown) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (error as DeepNestedObject).message.toString() }))
  }
}

export const updateRoomsOrderController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = jwt.verify(cookies.token, secretCode) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const payload = await getBody<[number, number]>(req)

    const dbService = DBService.getInstance()

    await dbService.swapRooms(nickname, ...payload)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Room order changed successfully" }))
  } catch (error: unknown) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (error as DeepNestedObject).message.toString() }))
  }
}
export const getRoomController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = jwt.verify(cookies.token, secretCode) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const dbService = DBService.getInstance()

    const id = req.url?.split("/")?.at(-1)
    const author = req.url?.split("/")?.at(-2)

    if (!id || !author) {
      res.writeHead(400)
      return res.end()
    }

    const room = await dbService.getRoom(nickname, author, id)

    if (!room) {
      res.writeHead(404)
      return res.end("404")
    }

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ room }))
  } catch (error: unknown) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (error as DeepNestedObject).message.toString() }))
  }
}
export const updateRoomController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = jwt.verify(cookies.token, secretCode) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const payload = await getBody<{ room: IRoom }>(req)

    const dbService = DBService.getInstance()

    const id = req.url?.split("/")?.at(-1)

    if (!id) {
      res.writeHead(400)
      return res.end()
    }

    await dbService.updateRoom(nickname, payload.room, id)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Room changed successfully" }))
  } catch (error: unknown) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (error as DeepNestedObject).message.toString() }))
  }
}
export const deleteRoomController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = jwt.verify(cookies.token, secretCode) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const dbService = DBService.getInstance()

    const id = req.url?.split("/")?.at(-1)

    if (!id) {
      res.writeHead(400)
      return res.end()
    }

    await dbService.deleteRoom(nickname, id)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Room changed successfully" }))
  } catch (error: unknown) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (error as DeepNestedObject).message.toString() }))
  }
}
export const createRoomController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = jwt.verify(cookies.token, secretCode) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const { room } = await getBody<{ room: IRoomPayload }>(req)

    const newRoom: IRoom = {
      ...room,
      author: nickname,
      currentTime: 0,
      isPlaying: false,
      watchers: 0,
      id: makeUUID(),
    }

    const dbService = DBService.getInstance()

    await dbService.createRoom(nickname, newRoom)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Room created successfully" }))
  } catch (error: unknown) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (error as DeepNestedObject).message.toString() }))
  }
}
