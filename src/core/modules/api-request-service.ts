import { RequestListener } from "http"
import { authController, createPostController, deletePostController, getPostController, getPostsController, tokenUpdateController, updatePostController, updatePostsOrderController } from "./controller"
import { getContentType, makeDeleteCookie } from "../utils"

const apiRequestHandler: RequestListener = async (req, res) => {
  const url = req.url?.slice(1).split("/").slice(1)
  const postIdx = url?.at(-1) || ""

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
    case "/token":
      if (req.method === "POST") {
        return tokenUpdateController(req, res)
      }
      break
    case "/posts":
      if (req.method === "PUT" && /^\d+$/g.test(postIdx)) {
        return updatePostController(req, res)
      }
      if (req.method === "DELETE" && /^\d+$/g.test(postIdx)) {
        return deletePostController(req, res)
      } else if (req.method === "POST") {
        return createPostController(req, res)
      } else if (req.method === "GET") {
        if (/^\d+$/g.test(postIdx)) return getPostController(req, res)
        else return getPostsController(req, res)
      } else if (url?.at(1) === "order") {
        if (req.method === "PUT") {
          return updatePostsOrderController(req, res)
        }
      }
      break

    default: // break or return is missing for purpose
      res.writeHead(404)
      return res.end(JSON.stringify(url) || req.url?.toString() || "404")
  }
}

export default apiRequestHandler
