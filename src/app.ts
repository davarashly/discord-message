/*** Config ***/

import logger from "./modules/Logger"

require("./utils/config").default()

/*** Main ***/
import { MessageService } from "./modules/MessageService"

const messageService = new MessageService()

messageService.processMessages()

import http, { RequestListener } from "http"
import { pathResolve } from "./utils"
import fs from "fs/promises"

const host = "localhost"
const port = parseInt(process.env.BACKEND_PORT || "") || 8080

const requestListener: RequestListener = async (req, res) => {
  if (req.url !== "/") {
    res.writeHead(404)
    return res.end("404")
  }

  logger.log("log")
  logger.error("error")

  const logPath = pathResolve(process.cwd(), "logs", "info.log")
  const errorPath = pathResolve(process.cwd(), "logs", "error.log")

  const info = (await fs.readFile(logPath)).toString()
  const error = (await fs.readFile(errorPath)).toString()

  let html = (await fs.readFile(pathResolve(process.cwd(), "src", "public", "index.html"))).toString()

  html = transp(transp(html, "error", error), "info", info)

  res.writeHead(200)
  res.end(html)
}

const transp = (source: string, varName: string, value: string) => {
  return source.replace("#{" + varName + "}", value.replace('"', "'"))
}

const server = http.createServer(requestListener)

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
})
