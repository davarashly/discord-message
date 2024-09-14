import dotEnv from "dotenv-safe"
import { resolve as pathResolve } from "path"

export const config = () => {
  const path = pathResolve(process.cwd(), "config", ".env")
  const example = pathResolve(process.cwd(), "config", ".env.example")

  dotEnv.config({ allowEmptyValues: true, example, path })
}
