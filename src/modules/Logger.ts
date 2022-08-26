function log(...args: any[]) {
  const msg = prepareLog(args)

  console.log(msg)
}

function error(...args: any[]) {
  const msg = prepareLog(args)

  console.error(msg)
}

function prepareLog(args: any[]): string {
  const [dd, mm, yyyy, h, m, s] = [...new Date().toLocaleString("en-GB", { timeZone: "Israel" }).matchAll(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/gm)].flat().slice(1)

  const msg = args.map((el) => (typeof el === "object" ? JSON.stringify(el) : el.toString())).join(", ")

  return `[${dd}/${mm}/${yyyy} ${h.toString().padStart(2)}:${m.toString().padStart(2)}:${s.toString().padStart(2)}]: ${msg}`
}

export default { log, error }
