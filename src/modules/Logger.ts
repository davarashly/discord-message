import { pathResolve } from "../utils"
import fs from "fs/promises"
import mkdirp from "mkdirp"

function log(...args: any[]) {
  const msg = prepareLog(args)
  const logPath = pathResolve(process.cwd(), "logs", "info.log")

  write(logPath, msg).then(() => {
    console.log(msg)
  })
}

function error(...args: any[]) {
  const msg = prepareLog(args)
  const logPath = pathResolve(process.cwd(), "logs", "error.log")

  write(logPath, msg).then(() => {
    console.error(msg)
  })
}

function prepareLog(args: any[] = []): string {
  const [dd, mm, yyyy, h, m, s] = [...new Date().toLocaleString("en-GB", { timeZone: "Israel" }).matchAll(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/gm)].flat().slice(1)

  const msg = args.map((el) => (typeof el === "object" ? JSON.stringify(el, null, 2) : el.toString())).join(", ")

  return `[${dd}/${mm}/${yyyy} ${h.toString().padStart(2)}:${m.toString().padStart(2)}:${s.toString().padStart(2)}]: ${msg}`
}

async function write(path: string, msg: string) {
  const spl = path.split(/\/|\\/gm)
  const dirPath = pathResolve(spl.slice(0, spl.length - 1).join("/"))

  await mkdirp(dirPath)
  await fs.appendFile(path, msg + "\n")
}

export default { log, error }
