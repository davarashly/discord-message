import { readFileSync, writeFileSync } from "fs"
import { pathResolve } from "./"
import { config as dotEnvConfig } from "dotenv"

export default () => {
  dotEnvConfig({ path: pathResolve(process.cwd(), "config", ".env") })

  const path = pathResolve(process.cwd(), "node_modules", "discord.js-user-account", "src", "structures", "interfaces", "Application.js")
  const file = readFileSync(path).toString()

  writeFileSync(path, file.replace(/constructor\(client, data\)/gm, "constructor(client, data={})"))
}
