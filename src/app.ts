/*** Config ***/
require("./utils/config").default()

/*** Main ***/
import { AddressInfo } from "net"
import { MessageService } from "./modules/MessageService"
import server from "./modules/server"
import logger from "./modules/Logger"

const port = parseInt(process.env.BACKEND_PORT || "") || 8080

server.listen(port, "0.0.0.0", async () => {
  logger.log(`Server is running on http://${(server.address() as AddressInfo).address}:${port}`)

  await new MessageService().processMessages()
})
