import { getContentType, getPayload, makeCookie, makeDeleteCookie, parseCookies } from "../utils"
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
      if (nickname.trim().toLowerCase() === username.trim().toLowerCase() && (await bcrypt.compare(password, dbService.DB[nickname].hash))) {
        const userData: IUserData = {
          nickname,
          discordToken: dbService.DB[nickname].discordToken,
          isTokenValid: dbService.DB[nickname].isTokenValid
        }

        const token = jwt.sign(userData, secretCode, { expiresIn: "2d" })
        const cookies = [makeCookie("token", token), makeCookie("userData", JSON.stringify(userData), false)]

        res.setHeader("Set-Cookie", cookies)
        return res.end()
      }
    }

    throw new Error("User with this username and password wasn't found")
  } catch (error: any) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: error.message.toString() }))
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

    const payload = await getPayload<{ discordToken: string }>(req)
    const dbService = new DBService()

    await dbService.getDB()
    await dbService.setToken(nickname, payload.discordToken, true)

    const userData: IUserData = {
      nickname,
      discordToken: payload.discordToken,
      isTokenValid: true
    }

    const token = jwt.sign(userData, secretCode, { expiresIn: "2d" })
    const cookiesToSend = [makeCookie("token", token), makeCookie("userData", JSON.stringify(userData), false)]

    res.setHeader("Set-Cookie", cookiesToSend)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Token changed successfully" }))
  } catch (error: any) {
    const cookiesToSend = [makeDeleteCookie("token"), makeDeleteCookie("userData")]
    res.setHeader("Set-Cookie", cookiesToSend)
    res.writeHead(400)
    console.error(error)
    return res.end(JSON.stringify({ error: error.message.toString() }))
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

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ posts: posts ?? [] }))
  } catch (error: any) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: error.message.toString() }))
  }
}

export const updatePostsOrderController: RequestListener = async (req, res) => {
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

    const payload = await getPayload<[number, number]>(req)

    const dbService = new DBService()

    await dbService.swapPosts(nickname, ...payload)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Post order changed successfully" }))
  } catch (error: any) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: error.message.toString() }))
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

    const idx = parseInt(req.url?.split("/")?.at(-1) || "1") - 1

    const post = await dbService.getPost(nickname, +idx)

    if (!post) {
      res.writeHead(404)
      return res.end("404")
    }

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ post }))
  } catch (error: any) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: error.message.toString() }))
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

    const idx = parseInt(req.url?.split("/")?.at(-1) || "1") - 1

    await dbService.updatePost(nickname, payload.post, +idx)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Post changed successfully" }))
  } catch (error: any) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: error.message.toString() }))
  }
}
export const deletePostController: RequestListener = async (req, res) => {
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

    const idx = parseInt(req.url?.split("/")?.at(-1) || "-10") - 1

    await dbService.deletePost(nickname, +idx)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Post changed successfully" }))
  } catch (error: any) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: error.message.toString() }))
  }
}
export const createPostController: RequestListener = async (req, res) => {
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
    payload.post.status = "n/a"

    const dbService = new DBService()

    await dbService.createPost(nickname, payload.post)

    res.writeHead(200, { "Content-Type": getContentType(".json") })

    return res.end(JSON.stringify({ message: "Post created successfully" }))
  } catch (error: any) {
    console.error(error)
    res.writeHead(400)
    return res.end(JSON.stringify({ error: error.message.toString() }))
  }
}
