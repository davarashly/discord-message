import { config } from "./config"

config()

export const PORT = parseInt(process.env.PORT || "") || 8080
export const isDev = process.env.NODE_ENV === "dev"
export const isProd = !isDev
export const secretCode = process.env.SECRET as string
