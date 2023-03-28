import { RequestListener } from "http"
import { authController, getPostsController, tokenUpdateController, updatePostsController } from "./controller"

const apiRequestHandler: RequestListener = async (req, res) => {
  const url = req.url?.slice(4)

  switch (url) {
    case "/auth":
      if (req.method === "POST") {
        return authController(req, res)
      }
    case "/token":
      if (req.method === "POST") {
        return tokenUpdateController(req, res)
      }
    case "/posts":
      if (req.method === "POST") {
        return updatePostsController(req, res)
      } else if (req.method === "GET") {
        return getPostsController(req, res)
      }
    default: // break or return is missing for purpose
      res.writeHead(404)
      return res.end(req.url?.toString() || "404")
  }
}

export default apiRequestHandler
