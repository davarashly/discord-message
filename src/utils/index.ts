import { readFileSync } from "fs"
import { resolve } from "path"
import { TSConfigJSON } from "types-tsconfig"

const jsonCleanComments = (json: string) => JSON.parse(json.replace(/\s+\/\*.*\*\/|\/\/.*/gm, ""))

export const pathResolve = resolve
export const readFile = (path: string): Buffer => readFileSync(pathResolve(path))
export const getTsConfig = (): TSConfigJSON => jsonCleanComments(readFile(process.cwd() + "/tsconfig.json").toString())
export const hrsToMilliseconds = (hrs: number) => hrs * 60 * 60 * 1000
