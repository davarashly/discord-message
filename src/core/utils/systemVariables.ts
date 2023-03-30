import { pathResolve } from "./index"

require("dotenv").config({ path: pathResolve(process.cwd(), "config", ".env") })

export const PORT = parseInt(process.env.BACKEND_PORT || "") || 8080
export const isDev = process.env.NODE_ENV === "dev"
export const isProd = !isDev
export const secretCode = process.env.SECRET as string
