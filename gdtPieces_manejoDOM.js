let listDenyDomain;
let listTarget = 0;

//document.getElementsByTagName("a");

//Obteniendo listado de target 'a'

//Se envia primero a la capa de negocio
window.postMessage({
  type: "gdtBrowserWebMessage",
  command: "INIT",
  href: window.location.href,
});

window.close = function () {
  window.postMessage({ type: "gdtBrowserWebMessage", command: "CLOSE" });
};

window.gdtBrowser = {
  Command: function (command) {
    window.postMessage({
      type: "gdtBrowserWebMessage",
      command: command,
      href: window.location.href,
    });
  },
  Log: function (message) {
    window.postMessage({
      type: "gdtBrowserWebMessage",
      command: "LOG",
      message: message,
      href: window.location.href,
    });
  },
  Plugin: function (plugin, data, callback) {
    window.postMessage({
      type: "gdtBrowserWebMessage",
      command: "PLUGIN",
      plugin: plugin,
      data: data,
      callback: callback,
      href: window.location.href,
    });
  },
};

window.addEventListener("message", function (event) {
  if (
    event.source == window &&
    event.data.type == "gdtBrowserMessage" &&
    (event.data.href == undefined || event.data.href == window.location.href)
  ) {
    switch (event.data.command) {
      case "DATA":
        window[event.data.callback](event.data.data);
        break;
      case "EXECUTE":
        window.eval(event.data.script);
        break;
      case "blacklist":
        if(event.data.script === undefined) return;

        listDenyDomain = event.data.script;
        addEventDenyDomain("MESSAGE");
      break;
    }
  }
});

// console.log(listDenyDomian);

// document.addEventListener('DOMContentLoaded', ()=>{
//   addEventDenyDomain("DOM");
//  } );

/*document.addEventListener('DOMContentLoaded', function(){
  if( listTarget !== undefined && listTarget.length > 0){
    console.log("Tenemos producto, YA NO REQUERIMOS");
    console.log(listTarget);
  }else{
    console.log("NO TENEMOS NADA, PROCEDEMOS A AGREGAR LA COLLECION DE DATOS");
    listTarget = document.getElementsByTagName("a");
    console.log(listTarget);
    addEventDenyDomain(listTarget)
  }
  // if(listTarget === undefined){

  //   console.log("Muy buenas tardes, el DOM etsa listo");
  //   listTarget = document.getElementsByTagName("a");
  //   console.log("El resultado es");
  //   console.log( listTarget );
  // }
});*/


function addEventDenyDomain(turno) {
  console.log( "TURNO DE " +  turno);
  let collecTargets = document.getElementsByTagName("a").length;
  console.log(listDenyDomain);
  console.log( collecTargets );

  if(listDenyDomain === undefined || collecTargets <= 0 || collecTargets === undefined) return; //Validando la lista de dominions bloqeuados
  
  
  console.log("Trabajando las url a denegar, tengo esto:");
  console.log(listDenyDomain);
  console.log( Object.keys(listDenyDomain).length );

  console.log("Iniciando alteracion de evenetos");
  Array.from(document.getElementsByTagName("a")).forEach(function(item) {
    for( let clave in listDenyDomain ){
      // console.log(listDenyDomain[clave]);
      if( item.href.includes(getObjUrl(listDenyDomain[clave]) || item.href.includes("http://") || item.href.includes("https://")) ){
        console.log( "La URL: " + item.href + " es un dominio denegado" );
        item.setAttribute("href", "#");
      }
    }
 });


 function getObjUrl(urlString){
  console.log( "URL => string to URL" );
  let getURL = new URL(urlString)
  let getParamUrl = {
    host     : getURL.host,
    hostName : getURL.hostname,
    url      : getURL.href,
    urlOrigin: getURL.origin,
    protocol : getURL.protocol
  }
  // return getURL.hostname;   //ESTA OPCION ES MAS CORTA, PROBAR ANTES
  return getParamUrl.hostName;
}

}

