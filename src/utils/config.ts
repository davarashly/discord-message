import "module-alias/register"
import { registerAliases } from "./registerAliases"
import { readFileSync, writeFileSync } from "fs"
import { pathResolve } from "@/utils/index"

declare global {
  interface String {
    capitalize: () => string
  }
}

export function capitalize(this: string) {
  const words = this.split(" ")

  return words.map((word) => word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
}

export default () => {
  registerAliases()

  String.prototype.capitalize = capitalize

  const path = pathResolve(process.cwd(), "node_modules", "discord.js-user-account", "src", "structures", "interfaces", "Application.js")
  const file = readFileSync(path).toString()

  writeFileSync(path, file.replace(/constructor\(client, data\)/gm, "constructor(client, data={})"))
}
