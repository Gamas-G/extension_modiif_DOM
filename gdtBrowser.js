//Leemos la lista del json


// document.getElementsByClassName( "vtex-sticky-layout-0-x-wrapper" )[0].style.backgroundColor = "red";
// console.log("Hola la clase");
// console.log(obtenerDom);

getDenySites();

async function getDenySites() {
  try {
  console.log("INICIO DE BLACK LIST");
  let getUrlJSON = chrome.runtime.getURL("gdtBlackList.json");
  console.log("URL de obtenida con la api :\n" + getUrlJSON);
  let respFetch = await fetch( getUrlJSON );
  let respJson = await respFetch.json();

  console.log(respJson);
  console.log( "COMUNICANDOME CON gdtBrowserBack.js" );
  chrome.runtime.sendMessage({
    command:"blacklist",
    data:respJson
  });
  //MENSAJE QUE SE ENVIA EL FRONT FRONT (gdtPieces.js)
  /*window.postMessage({
    type: "gdtBrowserMessage",
    command: "URLJSON",
    script: respJson,
    href: undefined,
  })*/
} catch (error) {
  console.log( "OCURRIO UN ERROR AL CONSULTAR LA BLACKLIST" );
  console.log( error );   
}
}

/*recibe desde browser back*/
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.command) {
    case "DATA":
      window.postMessage({
        type: "gdtBrowserMessage",
        command: message.command,
        data: message.data,
        callback: message.callback,
        href: message.href,
      });
      break;
    case "EXECUTE":
      window.postMessage({
        type: "gdtBrowserMessage",
        command: message.command,
        script: message.script,
        href: message.href,
      });
      break;
      default:
        console.log("message *");
        console.log(message.gdtPopup);
        console.log(message.windowType);
        window.postMessage({
          id : message.gdtPopup.id,
          windowId : message.gdtPopup.windowId,
          type: "gdtBrowserMessage",
          title: message.gdtPopup.title,
          command: "EMERG",
          windowType: message.windowType,
          href: message.gdtPopup.url,
        });
        break;
  }
});

window.addEventListener("keydown", function (event) {
  if (event.ctrlKey || (event.keyCode >= 112 && event.keyCode <= 123)) {
    event.preventDefault();
  }
});
/*recibe mensaje desde las llamadas de window.gdtBrowser.[Command, Log, Plugin]*/
/*enviar mensaje a exe*/
window.addEventListener("message", function (event) {
  if (event.source == window && event.data.type == "gdtBrowserWebMessage") {
    chrome.runtime.sendMessage(event.data);
  }
});

let gdtBrowserLoad = document.createElement("script");
gdtBrowserLoad.src = chrome.runtime.getURL("gdtPieces.js");
gdtBrowserLoad.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(gdtBrowserLoad);

