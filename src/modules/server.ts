import { RequestListener, createServer } from "http"
import { pathResolve, transpileHtml } from "../utils"
import fs from "fs/promises"

const requestListener: RequestListener = async (req, res) => {
  if (req.url !== "/") {
    try {
      const filePath = pathResolve(process.cwd(), "src", "public", req.url?.slice(1) || "")

      await fs.stat(filePath)

      const file = await fs.readFile(filePath)

      res.writeHead(200)
      return res.end(file)
    } catch (e) {
      res.writeHead(404)
      return res.end("404")
    }
  }

  const logPath = pathResolve(process.cwd(), "logs", "info.log")
  const errorPath = pathResolve(process.cwd(), "logs", "error.log")

  const info = (await fs.readFile(logPath)).toString()
  const error = (await fs.readFile(errorPath)).toString()

  let html = (await fs.readFile(pathResolve(process.cwd(), "src", "public", "index.html"))).toString()

  html = transpileHtml(html, { info, error })

  res.writeHead(200)
  res.end(html)
}

const server = createServer(requestListener)

export default server
