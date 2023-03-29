import { getContentType, getExtension, getPayload, makeCookie, makeDeleteCookie, parseCookies } from "../utils"
import { DBService } from "./message-service"
import jwt from "jsonwebtoken"
import { secretCode } from "../utils/systemVariables"
import { RequestListener } from "http"
import { IMessage } from "../interfaces/IMessage"

import bcrypt from "bcrypt"
import { IUserData } from "../interfaces"
import JwtPayload from "../interfaces/JwtPayload"

export const authController: RequestListener = async (req, res) => {
  try {
    const { username, password } = await getPayload<{ username: string; password: string }>(req)

    if (!username || !password) throw new Error("Username or password wasn't specified")

    const dbService = new DBService()
    await dbService.getDB()

    for (const nickname in dbService.DB) {
      if (nickname === username && (await bcrypt.compare(password, dbService.DB[nickname].hash))) {
        const userData: IUserData = {
          nickname,
          token: dbService.DB[nickname].token
        }

        const token = jwt.sign(userData, secretCode, { expiresIn: "2d" })
        const cookies = [makeCookie("token", token), makeCookie("userData", JSON.stringify(userData), false)]

        res.setHeader("Set-Cookie", cookies)
        return res.end()
      }
    }

    throw new Error("User with this username and password wasn't found")
  } catch (error) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (<any>error).message!.toString() }))
  }
}
export const tokenUpdateController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = (await jwt.verify(cookies.token, secretCode)) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const payload = await getPayload<{ token: string }>(req)
    const dbService = new DBService()

    await dbService.setToken(nickname, payload.token)

    const userData: IUserData = {
      nickname,
      token: payload.token
    }

    const token = jwt.sign(userData, secretCode, { expiresIn: "2d" })
    const cookiesToSend = [makeCookie("token", token), makeCookie("userData", JSON.stringify(userData), false)]

    res.setHeader("Set-Cookie", cookiesToSend)

    res.writeHead(200, { "Content-Type": getContentType(getExtension(".json")) })

    return res.end(JSON.stringify({ message: "Token changed successfully" }))
  } catch (error) {
    const cookiesToSend = [makeDeleteCookie("token"), makeDeleteCookie("userData")]
    res.setHeader("Set-Cookie", cookiesToSend)
    res.writeHead(400)
    console.error(error)
    return res.end(JSON.stringify({ error: (<any>error).message!.toString() }))
  }
}
export const getPostsController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = (await jwt.verify(cookies.token, secretCode)) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const dbService = new DBService()

    const posts = await dbService.getPosts(nickname)

    res.writeHead(200, { "Content-Type": getContentType(getExtension(".json")) })

    return res.end(JSON.stringify({ posts }))
  } catch (error) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (<any>error).message!.toString() }))
  }
}
export const getPostController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = (await jwt.verify(cookies.token, secretCode)) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const dbService = new DBService()

    const idx = req.url!.split("/").at(-1) || -1

    const post = await dbService.getPost(nickname, +idx)

    if (!post) {
      res.writeHead(404)
      return res.end("404")
    }

    res.writeHead(200, { "Content-Type": getContentType(getExtension(".json")) })

    return res.end(JSON.stringify({ post }))
  } catch (error) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (<any>error).message!.toString() }))
  }
}
export const updatePostController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    const jwtPayload = (await jwt.verify(cookies.token, secretCode)) as JwtPayload
    const { nickname } = JSON.parse(cookies.userData ?? "{}")

    if (jwtPayload.nickname !== nickname) {
      throw new Error()
    }

    const payload = await getPayload<{ post: IMessage }>(req)

    const dbService = new DBService()

    const idx = req.url!.split("/").at(-1) || -1

    await dbService.updatePost(nickname, payload.post, +idx)

    res.writeHead(200, { "Content-Type": getContentType(getExtension(".json")) })

    return res.end(JSON.stringify({ message: "Posts changed successfully" }))
  } catch (error) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: (<any>error).message!.toString() }))
  }
}
