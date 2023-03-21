var aTags = document.querySelectorAll("a");
var preTag = document.querySelector("pre");
var socket = io();
var activePage = "info";
var scrollToBottom = function () { return window.scrollTo(0, document.body.clientHeight); };
socket.on("disconnect", function () {
    socket.connect();
});
socket.on("info", function (msg) {
    logs.info += msg;
    if (activePage === "info") {
        preTag.innerHTML = processLog(logs.info);
        scrollToBottom();
    }
});
socket.on("error", function (msg) {
    logs.error += msg;
    if (activePage === "error") {
        preTag.innerHTML = processLog(logs.error);
        scrollToBottom();
    }
});
var processLog = function (log) {
    return log.replaceAll(/\[.+]:\s/gm, function (m) { return "<b>".concat(m, "</b>"); });
};
preTag.innerHTML = processLog(logs.info);
scrollToBottom();
var _loop_1 = function (aTag) {
    aTag.onclick = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        activePage = aTag.dataset.page;
        preTag.innerHTML = processLog(logs[activePage]);
        preTag.className = activePage;
        scrollToBottom();
        for (var _i = 0, aTags_2 = aTags; _i < aTags_2.length; _i++) {
            var aTag1 = aTags_2[_i];
            if (aTag1.dataset.page !== activePage) {
                aTag1.classList.remove("active");
            }
        }
        aTag.classList.add("active");
    };
};
for (var _i = 0, aTags_1 = aTags; _i < aTags_1.length; _i++) {
    var aTag = aTags_1[_i];
    _loop_1(aTag);
}
//# sourceMappingURL=main.js.map