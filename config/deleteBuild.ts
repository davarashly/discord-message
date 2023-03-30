import { getTsConfig, pathResolve } from "../src/core/utils"
import * as fs from "fs"

fs.rmSync(pathResolve(process.cwd(), getTsConfig().compilerOptions!.outDir!), { recursive: true, force: true })
