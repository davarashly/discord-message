/*** Config ***/
require("./utils/config").default()

/*** Main ***/
import { MessageService } from "@/modules/MessageService"

const messageService = new MessageService()

messageService.processMessages()
