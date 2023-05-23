import { readFileSync } from "fs"
import { resolve } from "path"
import { TSConfigJSON } from "types-tsconfig"
import { IncomingMessage } from "http"
import mime from "mime-types"

export const jsonCleanComments = <T = Record<string, any>>(json: string): T => JSON.parse(json.replace(/\s+\/\*.*\*\/|\s+\/\/.*/gm, ""))

export const pathResolve = resolve
export const readFile = (path: string): Buffer => readFileSync(pathResolve(path))
export const getTsConfig = (): TSConfigJSON => jsonCleanComments(readFile(process.cwd() + "/tsconfig.json").toString())
export const hrsToMilliseconds = (hrs: number) => hrs * 60 * 60 * 1000

export const getContentType = (ext: string) => mime.lookup(ext) || ""

export const getPayload = <T = Record<string, any>>(req: IncomingMessage) =>
  new Promise<T>((resolve, reject) => {
    let data = ""
    req.on("data", (chunk) => {
      data += chunk
    })
    req.on("end", () => {
      try {
        const payload = JSON.parse(data)
        resolve(payload)
      } catch (error) {
        console.error("Error parsing JSON:", error)
        reject(error)
      }
    })
  })

export const parseCookies = <T = Record<string, string>>(cookieHeader: string) => {
  const cookies = {} as Partial<T>

  if (cookieHeader) {
    const rawCookies = cookieHeader.split(";")

    for (const rawCookie of rawCookies) {
      const [key, value] = rawCookie.trim().split("=")
      cookies[key as keyof T] = value as T[keyof T]
    }
  }

  return cookies
}

export const makeCookie = (key: string, value: string, httpOnly = true) => `${key}=${value}; Path=/; ${httpOnly ? "HttpOnly; " : ""}SameSite=Strict; Max-Age=${24 * 60 * 60 * 2}`
export const makeDeleteCookie = (key: string) => `${key}=abc123; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
