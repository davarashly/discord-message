import { RequestListener, createServer } from "http"
import { getExtension, pathResolve } from "../utils"
import fs from "fs/promises"
import SocketMgr from "./socket"
import { isProd } from "../utils/systemVariables"
import { build, createServer as createViteServer } from "vite"

const requestListener: RequestListener = async (req, res) => {
  if (req.url !== "/") {
    try {
      const filePath = pathResolve(process.cwd(), "src/frontend/build/public", req.url?.slice(1) || "")
      await fs.stat(filePath)

      const file = await fs.readFile(filePath)

      res.writeHead(200, { "Content-Type": getContentType(getExtension(req.url!)) })
      return res.end(file)
    } catch (e) {
      res.writeHead(404)
      return res.end("404")
    }
  }

  const logPath = pathResolve(process.cwd(), "logs", "info.log")
  const errorPath = pathResolve(process.cwd(), "logs", "error.log")

  // const info = (await fs.readFile(logPath).catch(() => "")).toString()
  // const error = (await fs.readFile(errorPath).catch(() => "")).toString()

  let html = (await fs.readFile(pathResolve(process.cwd(), "src", "frontend", "build", "index.html"))).toString()

  // html = transpileHtml(html, { info, error })

  res.writeHead(200, { "Content-Type": getContentType(".html") })
  res.end(html)
}

const getContentType = (ext: string) => {
  switch (ext) {
    case ".html":
      return "text/html"
    case ".js":
      return "application/javascript"
    case ".css":
      return "text/css"
    case ".json":
      return "application/json"
    default:
      return "application/octet-stream"
  }
}

const devRequestListener = (): RequestListener => {
  const vite = createViteServer({
    configFile: pathResolve(process.cwd(), "vite.config.ts"),
    server: { middlewareMode: true }
  })

  return async (req, res) => {
    // Use Vite's middleware for development mode
    ;(await vite).middlewares(req, res, () => {
      // Unhandled requests will be passed here
      res.statusCode = 404
      res.end()
    })
  }
}

const server = createServer(isProd ? requestListener : devRequestListener())

export const socketMgr = new SocketMgr(server)
export default server
