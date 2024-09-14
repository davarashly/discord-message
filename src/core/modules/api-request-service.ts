import { RequestListener } from "http"
import {
  authController,
  createRoomController,
  deleteRoomController,
  getRoomController,
  getRoomsController,
  updateRoomController,
  updateRoomsOrderController,
} from "./controller"
import { getContentType, makeDeleteCookie } from "../utils"

const apiRequestHandler: RequestListener = async (req, res) => {
  const url = req.url?.slice(1).split("/").slice(1)
  const author = url?.at(-2) || ""
  const roomId = url?.at(-1) || ""

  switch ("/" + url?.at(0)) {
    case "/auth":
      if (req.method === "POST") {
        return authController(req, res)
      }
      break
    case "/logout":
      const deleteCookies = [makeDeleteCookie("userData"), makeDeleteCookie("token")]
      res.setHeader("Set-Cookie", deleteCookies)
      res.writeHead(200, { "Content-Type": getContentType(".json") })

      return res.end("{}")
    case "/rooms":
      if (req.method === "PUT" && roomId) {
        return updateRoomController(req, res)
      }
      if (req.method === "DELETE" && roomId) {
        return deleteRoomController(req, res)
      } else if (req.method === "POST") {
        return createRoomController(req, res)
      } else if (req.method === "GET") {
        if (roomId && author) {
          return getRoomController(req, res)
        } else {
          return getRoomsController(req, res)
        }
      } else if (url?.at(1) === "order") {
        if (req.method === "PUT") {
          return updateRoomsOrderController(req, res)
        }
      }
      break

    default: // break or return is missing for purpose
      res.writeHead(404)
      return res.end(JSON.stringify(url) || req.url?.toString() || "404")
  }
}

export default apiRequestHandler
