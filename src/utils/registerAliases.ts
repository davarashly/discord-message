import { getTsConfig, pathResolve } from "./"
import { register } from "tsconfig-paths"

const tsConfig = getTsConfig()

export const registerAliases = () =>
  register({
    baseUrl: tsConfig.compilerOptions?.baseUrl ?? pathResolve(process.cwd() + "/src"),
    paths: tsConfig.compilerOptions?.paths ?? {}
  })
