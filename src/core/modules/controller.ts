import { getContentType, getExtension, getPayload, makeCookie, makeDeleteCookie, parseCookies } from "../utils"
import { DBService } from "./message-service"
import jwt from "jsonwebtoken"
import { secretCode } from "../utils/systemVariables"
import { RequestListener } from "http"
import { IMessage } from "../interfaces/IMessage"

export const authController: RequestListener = async (req, res) => {
  try {
    const { username, password } = await getPayload<{ username: string; password: string }>(req)

    if (!username || !password) throw new Error()

    const dbService = new DBService()
    await dbService.getDB()

    for (const nickname in dbService.DB) {
      if (nickname === username) {
        const token = jwt.sign({ nickname }, secretCode, { expiresIn: "2d" })
        const cookies = [
          makeCookie("token", token),
          makeCookie(
            "userData",
            JSON.stringify({
              nickname,
              token: dbService.DB[nickname].token
            })
          )
        ]

        res.setHeader("Set-Cookie", cookies)
        return res.end()
      }
    }

    throw new Error()
  } catch (error) {
    console.error(error)
    res.writeHead(400)
    return res.end()
  }
}
export const tokenUpdateController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    await jwt.verify(cookies.token, secretCode)

    const payload = await getPayload<{ token: string }>(req)
    const dbService = new DBService()
    const nickname = JSON.parse(cookies.userData).nickname

    await dbService.setToken(nickname, payload.token)

    const token = jwt.sign({ nickname }, secretCode, { expiresIn: "2d" })
    const cookiesToSend = [
      makeCookie("token", token),
      makeCookie(
        "userData",
        JSON.stringify({
          nickname,
          token: payload.token
        })
      )
    ]

    res.setHeader("Set-Cookie", cookiesToSend)

    res.writeHead(200, { "Content-Type": getContentType(getExtension(".json")) })

    return res.end(JSON.stringify({ message: "Token changed successfully" }))
  } catch (error) {
    const cookiesToSend = [makeDeleteCookie("token"), makeDeleteCookie("userData")]
    res.setHeader("Set-Cookie", cookiesToSend)
    res.writeHead(400)
    console.error(error)
    return res.end()
  }
}
export const getPostsController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    await jwt.verify(cookies.token, secretCode)

    const dbService = new DBService()
    const nickname = JSON.parse(cookies.userData).nickname

    const posts = await dbService.getPosts(nickname)

    res.writeHead(200, { "Content-Type": getContentType(getExtension(".json")) })

    return res.end(JSON.stringify({ posts }))
  } catch (error) {
    console.error(error)
    res.writeHead(400)
    return res.end()
  }
}
export const updatePostsController: RequestListener = async (req, res) => {
  const cookies = parseCookies<{ token: string; userData: string }>(req.headers.cookie!)

  if (!cookies.token || cookies.token.toString().length < 10) {
    res.writeHead(400)
    return res.end()
  }

  try {
    await jwt.verify(cookies.token, secretCode)

    const payload = await getPayload<{ posts: IMessage[] }>(req)

    const dbService = new DBService()
    const nickname = JSON.parse(cookies.userData).nickname

    await dbService.updatePosts(nickname, payload.posts)

    res.writeHead(200, { "Content-Type": getContentType(getExtension(".json")) })

    return res.end(JSON.stringify({ message: "Posts changed successfully" }))
  } catch (error) {
    console.error(error)
    res.writeHead(400)
    return res.end()
  }
}
