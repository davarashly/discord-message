/*** Config ***/
import { config } from "./core/utils"

config()

/*** Main ***/
import { AddressInfo } from "net"
import { logger, server } from "./core/modules"
import { isProd, PORT } from "./core/utils"

const hostname = isProd ? "0.0.0.0" : "127.0.0.1"

server.listen(PORT, hostname, async () => {
  logger.log(`Server is running on http://${(server.address() as AddressInfo).address}:${PORT}`)
})
