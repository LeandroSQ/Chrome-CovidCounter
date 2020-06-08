let script = document.createElement("script");
script.src = chrome.runtime.getURL("injectable.js");
script.onload = function() {
    console.log("[COVID-COUNTER] Script injected and loaded!");
    this.remove();
};

(document.head || document.documentElement).appendChild(script);
