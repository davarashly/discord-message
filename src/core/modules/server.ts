import { RequestListener, createServer } from "http"
import { getContentType, getExtension, pathResolve } from "../utils"
import fs from "fs/promises"
import SocketMgr from "./socket"
import { isProd } from "../utils/systemVariables"
import { createServer as createViteServer } from "vite"
import apiRequestHandler from "./api-request-service"

const requestListener: RequestListener = async (req, res) => {
  if (req.url?.startsWith("/api/")) {
    return apiRequestHandler(req, res)
  }

  try {
    const filePath = pathResolve(process.cwd(), "build/frontend", req.url?.slice(1) || "")

    await fs.stat(filePath)

    const file = await fs.readFile(filePath)

    res.writeHead(200, { "Content-Type": getContentType(getExtension(req.url!)) })

    return res.end(file)
  } catch (e) {
    const html = (await fs.readFile(pathResolve(process.cwd(), "build/frontend/index.html"))).toString()

    res.writeHead(200, { "Content-Type": getContentType(".html") })
    res.end(html)
  }
}

const devRequestListener = (): RequestListener => {
  const vite = createViteServer({
    configFile: pathResolve(process.cwd(), "vite.config.ts"),
    server: { middlewareMode: true }
  })

  return async (req, res) => {
    if (req.url?.startsWith("/api/")) {
      return apiRequestHandler(req, res)
    }

    ;(await vite).middlewares(req, res, () => {
      res.statusCode = 404
      res.end()
    })
  }
}

const server = createServer(isProd ? requestListener : devRequestListener())

export const socketMgr = new SocketMgr(server)
export default server
