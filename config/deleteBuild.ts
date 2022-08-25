import { getTsConfig, pathResolve } from "../src/utils"
import fs from "fs"

require("../src/utils/config").default()

fs.rmSync(pathResolve(process.cwd(), getTsConfig().compilerOptions!.outDir!), { recursive: true, force: true })
