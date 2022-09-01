const aTags = document.querySelectorAll("a")
const preTag = document.querySelector("pre")

const socket = io()

const scrollToBottom = () => window.scrollTo(0, document.body.clientHeight)

socket.on("disconnect", () => {
  socket.connect()
})

socket.on("info", (msg) => {
  logs.info += msg

  preTag.innerHTML = processLog(logs.info)
  scrollToBottom()
})

socket.on("error", (msg) => {
  logs.error += msg

  preTag.innerHTML = processLog(logs.error)
  scrollToBottom()
})

const processLog = (log) => {
  return log.replaceAll(/\[.+]:\s/gm, (m) => `<b>${m}</b>`)
}

preTag.innerHTML = processLog(logs.info)
scrollToBottom()

for (const aTag of aTags) {
  aTag.onclick = (evt) => {
    evt.preventDefault()
    evt.stopPropagation()

    const currentPage = aTag.dataset.page

    preTag.innerHTML = processLog(logs[currentPage])
    preTag.className = currentPage
    scrollToBottom()

    for (const aTag1 of aTags) {
      if (aTag1.dataset.page !== currentPage) {
        aTag1.classList.remove("active")
      }
    }

    aTag.classList.add("active")
  }
}
