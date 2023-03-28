/*** Config ***/
require("./core/utils/config").default()

/*** Main ***/
import { AddressInfo } from "net"
import { DBService } from "./core/modules/message-service"
import server from "./core/modules/server"
import logger from "./core/modules/logger"
import { build } from "vite"
import { pathResolve } from "./core/utils"
import { isProd, PORT } from "./core/utils/systemVariables"

const hostname = isProd ? "0.0.0.0" : "127.0.0.1"

const startServer = () =>
  server.listen(PORT, hostname, async () => {
    logger.log(`Server is running on http://${(server.address() as AddressInfo).address}:${PORT}`)

    // await new DBService().processMessages()
  })

if (isProd) {
  build({ configFile: pathResolve(process.cwd(), "vite.config.ts") }).then(startServer)
} else {
  startServer()
}
