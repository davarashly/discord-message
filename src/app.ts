/*** Config ***/
require("./core/utils/config").default()

/*** Main ***/
import { AddressInfo } from "net"
import { MessageService } from "./core/modules/message-service"
import server from "./core/modules/server"
import logger from "./core/modules/logger"
import { build } from "vite"
import { pathResolve } from "./core/utils"
import { isProd } from "./core/utils/systemVariables"

const port = parseInt(process.env.BACKEND_PORT || "") || 8080

server.listen(port, "0.0.0.0", async () => {
  logger.log(`Server is running on http://${(server.address() as AddressInfo).address}:${port}`)

  let promise: ReturnType<typeof build> | null = null

  if (isProd) {
    promise = build({ configFile: pathResolve(process.cwd(), "vite.config.ts") })
  }

  await Promise.all([new MessageService().processMessages(), promise])
})
