import { readFileSync } from "fs"
import { resolve } from "path"
import { TSConfigJSON } from "types-tsconfig"

export const jsonCleanComments = <T = Record<string, any>>(json: string): T => JSON.parse(json.replace(/\s+\/\*.*\*\/|\s+\/\/.*/gm, ""))

export const pathResolve = resolve
export const readFile = (path: string): Buffer => readFileSync(pathResolve(path))
export const getTsConfig = (): TSConfigJSON => jsonCleanComments(readFile(process.cwd() + "/tsconfig.json").toString())
export const hrsToMilliseconds = (hrs: number) => hrs * 60 * 60 * 1000

export const transpileHtml = (html: string, data: Record<string, string>) => {
  for (const key in data) {
    html = html.replace("#{" + key + "}", data[key].replaceAll('"', "'").replaceAll("`", "\\`"))
  }

  return html
}
