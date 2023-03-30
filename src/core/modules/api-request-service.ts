import { RequestListener } from "http"
import { authController, createPostController, deletePostController, getPostController, getPostsController, tokenUpdateController, updatePostController } from "./controller"
import { getContentType, getExtension, makeDeleteCookie } from "../utils"

const apiRequestHandler: RequestListener = async (req, res) => {
  const url = req.url?.slice(1).split("/")

  switch ("/" + url?.[1]) {
    case "/auth":
      if (req.method === "POST") {
        return authController(req, res)
      }
    case "/logout":
      const deleteCookies = [makeDeleteCookie("userData"), makeDeleteCookie("token")]
      res.setHeader("Set-Cookie", deleteCookies)
      res.writeHead(200, { "Content-Type": getContentType(getExtension(".json")) })

      return res.end('{}')
    case "/token":
      if (req.method === "POST") {
        return tokenUpdateController(req, res)
      }
    case "/posts":
      if (req.method === "PUT" && /^\d+$/g.test(url?.[2] || "")) {
        return updatePostController(req, res)
      }
      if (req.method === "DELETE" && /^\d+$/g.test(url?.[2] || "")) {
        return deletePostController(req, res)
      } else if (req.method === "POST") {
        return createPostController(req, res)
      } else if (req.method === "GET") {
        if (/^\d+$/g.test(url?.[2] || "")) return getPostController(req, res)
        else return getPostsController(req, res)
      }
    default: // break or return is missing for purpose
      res.writeHead(404)
      return res.end(JSON.stringify(url) || req.url?.toString() || "404")
  }
}

export default apiRequestHandler
