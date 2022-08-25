import { pathResolve } from "@/utils"

require("dotenv").config({ path: pathResolve(process.cwd(), "config", ".env") })

export const isDev = process.env.NODE_ENV === "dev"
export const isProd = !isDev
