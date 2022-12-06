//IMPORTS. GRACIAS A MI 'TYPE: MODULE' DE MI MANIFEST

//BACKGROUND DE MI EXTENSION

//LISTENER
chrome.runtime.onMessage.addListener( async (request, sender, sendResponse) => {
  switch (request.command) {
    case "CLOSE":
        chrome.storage.clear();
        chrome.windows.getCurrent(function (w) {
        chrome.windows.remove(w.id);
      });
      break;
      case "blacklist":
        console.log( "RECIBIENDO EL MESSAGE PARA LA BLACKLIST INICIAL" );
        // console.log( request.data );
        await validateBlackList( request.data );
        console.log( "FINALIZÓ LA BLACKLIST INICIAL" );
        console.log( "" );
      break;
      default:
        console.log("INICIO DE LOS TIEMPOS");
        await validateUrlOri(request.href);
        console.log("FINAL DE LOS TIEMPOS");
        console.log( "" );
        gdtBrowserPort.postMessage(request);
      break;
  }
});

// gdtSaveBaseUrl(location.href);
var gdtBrowserPort = chrome.runtime.connectNative("gdtbrowser");

gdtBrowserPort.onMessage.addListener(function (message) {
  switch (message.command) {
    case "DATA":
    case "EXECUTE":
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		if(chrome.tabs){
			chrome.tabs.sendMessage(tabs[0].id, message);
		}
      });
      break;
  }
});
gdtBrowserPort.onDisconnect.addListener(function () {
  setTimeout(function () {
    gdtBrowserPort = chrome.runtime.connectNative("gdtbrowser");
  }, 5000);
});

async function obtenerUrlBase() {
  let pathBas = undefined;
  console.log("BASEEEE ");
  let urlBase = chrome.storage.local.get( ["oriDomain"] );
  await urlBase.then( ( result ) => {
    console.log( "El valor es " + result );
    pathBas = result.oriDomain.urlOrigin;
  });
  return pathBas;

}

async function validateUrlOri(urlOri){
  try {
    console.log( "VALIDANDO URL DEL STORAGE" );
    await chrome.storage.local.get( ["oriDomain"] ).then( async (result) => {
      console.log( "El valor es el siguiente URL" );
      console.log( result.oriDomain );
      if( result.oriDomain !== undefined && result.oriDomain !== "" ){
        console.log( "Ya contamos con una URL origin |->" );
        console.log( result.oriDomain );
        console.log( "FINALIZÓ STORAGE" );
        console.log("");
        return;
      }
  
      console.log( "AUN NO TENEMOS LA URL PROMOGENITA \n INICIA EL SETEO DE LA URL PRIMOGENITA" );
      let setUrl = getObjUrl(urlOri);
      await setPathOrigin ( setUrl );
      await validateUrlOri( setUrl );
    } ); 
    console.log( "FINALIZÓ 'VALIDANDO URL DEL STORAGE'" );
    console.log( "" );
  } catch (error) {
    console.log( "Se detectó un error en validateUrlOri " + error );
  }
}


async function validateBlackList( blackList ){
  try {
    console.log( "VALIDANDO BLACKLIST DEL STORAGE" );
    // console.log( blackList );
    await chrome.storage.local.get( ["blackList"] ).then( async (result) => {
      console.log( "El valor es el siguiente blacklist" );
      console.log( result.blackList );
      if( result.blackList !== undefined && result.blackList !== "" ){
        console.log( "Ya contamos con una blacklist origin |->" );
        console.log( result.blackList );
        console.log( "FINALIZÓ STORAGE BLACKLIST" );
        console.log("");
        return;
      }
  
      console.log( "AUN NO TENEMOS LA BLACKLIST PROMOGENITA \n INICIA EL SETEO DE LA BLACKLIST PRIMOGENITA" );
      // let setUrl = getObjUrl(urlOri);
      await setBlackList ( blackList );
      await validateBlackList( blackList );
    } );
    // console.log( "FIN DE BLACKLIST" );
  } catch (error) {
    console.log( "Se detectó un error en validateBlackList " + error );
  }
}




//****************************************************   INTEGRACIÓN MV3, NUEVO SISTEMA DE NAVEGACIÓN   *********************************
let miVentana = "0";
let myKey;
let changeKey = "gdtKey";
let basUrl;
let windowTabs = 1;
let ventanas = [];

async function setPathOrigin(urlValue){
await chrome.storage.local.set( { oriDomain: urlValue } ).then( () => {
  console.log( "El obj URL se agregó ");
  console.log( urlValue );
} );
}

async function setBlackList(blackListValue){
  await chrome.storage.local.set( { blackList: blackListValue } ).then( () => {
    console.log( "Se creo la blackList ");
    console.log( blackListValue );
  } );
  }


async function getPathOrigin(urlValue){
  let path = undefined;
  let promesaPath = chrome.storage.local.get(["oriDomain"]);
  await promesaPath.then( ( result ) => {
    console.log( "El valor es " + result.orDomain );
    path = result.orDomain;
  });
  console.log( "El valor obtenido es " + path );
  return path
}

function validateProtocolo(urlProtocolo){
  // if( !urlProtocolo.includes("http") || !urlProtocolo.includes("https") ) return false;
  console.log( "Validando protocol " + "\"" + urlProtocolo.protocol +"\"" );
  return ( !urlProtocolo.protocol.includes("http:") && !urlProtocolo.protocol.includes("https:") ) ? false: true

  // return true;
}

function getObjUrl(urlString){
  console.log( "URL => CONVERT string to URL" );
  let getURL = new URL(urlString)
  let getParamUrl = {
    host     : getURL.host,
    hostName : getURL.hostname,
    url      : getURL.href,
    urlOrigin: getURL.origin,
    protocol : getURL.protocol
  }
  return getParamUrl;
}

async function testStora() {
  console.log("Funcion callback de getSotrage. \nTiene"); console.log( resulto );
}

async function black( url ) {
  let resultB = false;
console.log(url);
  let resultBlack = await chrome.storage.local.get(["blackList"]);
  if( resultBlack.blackList !== undefined && resultBlack.blackList !== ""){
    console.log( "Tenemos el resultGet" );
    console.log(resultBlack.blackList);
    for( let clave in resultBlack.blackList ){
      console.log( resultBlack.blackList[clave] );
      if( url.includes(resultBlack.blackList[clave]) ){
        console.log( "La URL se encuentra en la blackList " + resultBlack.blackList[clave] + " se debe de cancelar el acceso" );
        resultB = true;
        break;
      }
    }

  }


  // console.log("Final del getStorage \n Tenemos");
  // console.log(resultBlack);
  /*await chrome.storage.sync.get(["blackList"], function(resBlack) {
    if( resBlack.blackList !== undefined && resBlack.blackList !== "" ){
      console.log( resBlack.blackList );
      for( let clave in resBlack.blackList ){
        console.log(resBlack.blackList[clave]);
        // console.log(listDenyDomain[clave]);
        if( url.includes(resBlack.blackList[clave]) ){
          console.log( "La URL: " + resBlack.blackList[clave] + " es un dominio denegado" );
          resultB = true;
          break;
        }
      }
    }
  });*/

  /*await chrome.storage.local.get( ["blackList"] ).then( async (result) => {
    console.log( "VAMOS A VALIDAR LA BLACKLIST " );
    console.log( result.blackList );
    if( result.blackList !== undefined && result.blackList !== "" ){
      console.log( result.blackList );
      for( let clave in result.blackList ){
        console.log(result.blackList[clave]);
        // console.log(listDenyDomain[clave]);
        if( url.includes(result.blackList[clave]) ){
          console.log( "La URL: " + result.blackList[clave] + " es un dominio denegado" );
          resultB = true;
          break;
        }
      }
    }
  } );*/
  console.log(resultB);
  return resultB;
}

/*
 *****************************
  [0] => Bandera para Windows
  [1] => Bandera para Tabs
  [2] => Bandera any 
 */
 let bandSitesWeb = [false, false, false]

chrome.tabs.onUpdated.addListener( async function (tabId, changeInfo, tab) {
  if( changeInfo.status === "loading" && changeInfo.url !== undefined ){

  console.log("INFORMACIÓN " + tab.url + " (status: " + changeInfo.status + " )");
  let urlObjeto = getObjUrl( changeInfo.url ); //Obtenejos el Objeto URL
  console.log( urlObjeto );
  //Validamos si el la url tiene el protocolo http o https
  if( !validateProtocolo( urlObjeto ) ){ 
    console.log( "La url " + changeInfo.url + " no contiene ni uno de los protocolos http y https" );
    return;
  }

  //PARA TENER UNA SEGUNDA VALIDACIÓN DE LA PRIMOGENITA
  await validateUrlOri( urlObjeto.url );

  console.log("ENTRANDO A VALIDAR LA BLACKLIST");
  if(await black(urlObjeto.url)){
    console.log("ESTA URL ESTA DENY " + urlObjeto.url +  " cancelando url");
    try {
      console.log("INTENTANDO ACTUALIZANDO");
      chrome.tabs.update( { url: await obtenerUrlBase() } );
    } catch (error) {
      console.log( "NO SE PUDO RECARGAR EL SITIO WEB, ERROR EN LA EXTENSION" );
      console.log( error );
    }
    
    /*try {
      console.log("INTENTANDO UN GOBACK");
      chrome.tabs.goBack();
    } catch (error) {
      try {
        console.log("INTENTANDO ACTUALIZANDO");
        chrome.tabs.update( { url: await obtenerUrlBase() } );
      } catch (error) {
        console.log( "NO SE PUDO RECGAZAR EL SITIO WEB, ERROR EN LA EXTENSION" );
        console.log( error );
      }
    }*/
    // let mio = await obtenerUrlBase();
    // console.log( "el origin " + mio );
  }else{
    console.log("QUE PASOOO?");
  }

  /*let bandType;
  if( changeInfo.status === "loading" && changeInfo.url !== undefined ){
    let or = await getPathOrigin(changeInfo.url);
    if(or === undefined){
      console.log("No contengo la URL primogenita, procedo a settear la url " + changeInfo.url);
      setPathOrigin(changeInfo.url);
      or = await getPathOrigin(changeInfo.url);
    }
    console.log( "El origen es " + or );
    console.log("INFORMACIÓN " + tab.url + " (status: " + changeInfo.status + " )");
    if ( tab.url.includes(or)) {
      console.log("Estamos en el dominio");
    }else{
      console.log("El domino cambio");
    }*/
    // console.log( getPathOrigin() );
    /*console.log("tabId    => " + tabId + "\n"+
                "windowId => " + tab.windowId + "\n" +
                "url      => " + tab.url);
    
    if(await validateTypeWindow(tab.windowId)){
      console.log("INIT La ventana es PopUp, procede a terminar");
      console.log("FIN INFORMACIÓN\n");
      console.log("");
      return;
    }*/
    
    // OBTENEMOS EL ARRAY DE WINDOWS
    // await getWindows(tab.url, tab.windowId);

    // OBTENEMOS EL ARRAY DE TABS
    // await getTabsToWindow(tab.windowId);

    // SE DETECTARON MAS DE UNA VENTANA
    /*if(bandSitesWeb[0]){
      console.log("Se crea la ventana " + tab.title + " en PopUp");
    }*/
    // SE DETACTYARON MAS DE UN TAB
    /*else if(bandSitesWeb[1]){
      console.log("Se mantiene");
      let promesaTab = chrome.windows.get( tab.windowId );
      await promesaTab.then( value => { 
        console.log( "Este es el tipo de ventana" );
        console.log( value.type );
        console.log(value);
        bandType = value.type;
       } );
  
       if(bandType == "normal"){
        console.log( "Es normal, procedemos a crear un popUp y cerrar este tab " + tabId );
       }
       else if( bandType == "popup" ){
        console.log( "Es un popup, no procede nada" );
       }
    }*/


    console.log("FIN INFORMACIÓN\n");
    console.log("");
  
}


  // console.log(validaUrl('https://www.elektra.mx/'));
  /*if( changeInfo.status === "loading" && changeInfo.url !== undefined ){
    //if(await validaUrl(tab.url)) return;

  console.log("Se detecto un Tab");
  console.log("Validando tab");
  chrome.tabs.update(
    tabId,
    {
      url:changeInfo.url,
      active:false
    }
  );
  
  // console.log( validaTab(changeInfo.url) );
  if(!await validaTab(changeInfo.url)){
    console.log("Este tab ya existe, saliendo");
    // chrome.tabs.remove( tabId );
    return;
  }
  console.log("tabId Value: ");
  console.log(tabId);
  console.log("changeInfo value: ");
  console.log(changeInfo);
  console.log("tab Value: ");
  console.log(tab);
  tab.active = false;
  console.log(tab.active);

  chrome.windows.create(
    {
      url : tab.url,
      type: "popup"
    },
    (windows)=>{
      console.log(windows);
      // chrome.tabs.remove(tabId);
    }
);

}*/
} );//EVENTO ESCUCHA, CUANDO DETECTA UN TAB

async function validateTypeWindow(windowId){
  let result = false;
  console.log( "Validando el tipo de ventana" );
  let promesaType = chrome.windows.get( windowId );
  console.log(promesaType);
  await promesaType.then( value => {
    console.log(value);
    if (value.type == "popup"){ result = true }
  } );
  return result;
}

async function getWindows(url, windowId){
  bandSitesWeb[0] = false;
  let promesaWindows = chrome.windows.getAll();
  await promesaWindows.then( async value => {
      if(value.length > 1){
        console.log("Se detectaron " + value.length + " ventanas");
        console.log(value);
        if( value[0].id === windowId ){
          console.log( "La ventana es la misma" );
        }else{
          console.log("LA ventana es diferente");
          await cerrarWindow(windowId);
          crearPopUp(url);
        }
        /*if(value.type == "popup"){
          console.log("Es un PopUp, me cancelo");
        }
        else if(value.type == "normal"){
          console.log("Es normal, creamos un popUp");
        }*/
        /*console.log("Procedo a crear en PopUp");
        chrome.windows.create(
          {
            url : url,
            type: "popup"
          }
        );*/
        bandSitesWeb[0] =  true;
        return;
      }
    });
    // return false;
}

async function getTabsToWindow(window_Id){
  bandSitesWeb[1] = false;
  let promesaTabs = chrome.tabs.query( { windowId: window_Id } );
  await promesaTabs.then( value => {
    if(value.length > 1){
      console.log("Se detectaron " + value.length + " tabs");
      console.log(value);
      bandSitesWeb[1] = true;
      /*console.log("Procedo a crear en PopUp");
        chrome.windows.create(
          {
            url : url,
            type: "popup"
          }
        );*/
      return;
    }
  } );
  // console.log(promesa);
}

function validaMyKey(){
  let valor = false;
  chrome.storage.local.get([chengeKey], function(result) {
    myKey = result.key;
  });
  return valor;
}

function validarSto(url){
  console.log("Validando");
  let valueUrl;
  console.log(url);
  chrome.storage.local.get(["windowPop"], function(result){
    console.log("en la funcion " + result.windowPop);
    valueUrl = result.windowPop;
  });
  console.log("Final de valida " + valueUrl);
  if(valueUrl === url){
    return false;
  }
  return true;
}

async function validaUrl(urlEKT){
  console.log(urlEKT);
  let obVentana = [];
  if(urlEKT.startsWith('https://www.elektra.mx/')){
    let promesa = chrome.windows.getAll();
    promesa.then(value => {
      console.log(value);
      for (let index = 1; index < value.length; index++) {
        console.log("Validando crack");
        console.log(value[index]);
        
      }
    });
    /*console.log("Obteniendo en url");
    console.log(chrome.windows.getAll());
    alert("Hola mundo");*/
    return true;
  }
  return false;
}


function validatedIsTab(){

}


async function validaTab(urlTab){
  var band = true;
   var cont = 0;
  let promesa = chrome.tabs.query( { url: urlTab } );
  await promesa.then( value => {
    console.log("Conte");
    console.log(value.length);
    cont = value.length
    if(value.length > 1) band = false;
  } );
  /*chrome.tabs.query(
    {url: urlTab},
    (result) =>{
      if(result.length > 1){
        console.log("Esta url ya esta ABIERTA, tiene mas de un tab");
        cont = 1;
      }
      // for (let index = 0; index < result.length; index++) {
      //   if(result[index] == urlTab && result.length > 1){
      //     return false;
      //   }
        
      // }
      console.log(result);
    }
  );*/
  console.log("Retornamos la bander");
  console.log(band);
  return band;
}

//---------------------------------------------------------------EVENTOS DE VENTANAS-------------------------------------------
//onBoundsChanged. SE EJECUTA CUANDO LA VENTANA SE MUEVE DE SU POSICIÓN (LA MINIMIZAMOS O CAMBIAMOS DE POSICIÓN)
/*chrome.windows.onBoundsChanged.addListener(
  ( window ) => {
    console.log("En el onBoundsChanged")
    console.log( window );
    console.log("FIN ONBOUNDSCHANGED");
    // window.type = "popup"
    // console.log(window);
  }
);*/

//VALIDAR LA VENTANA DE CREACION PARA ELIMINAR EL FOCUS
/*chrome.windows.onCreated.addListener(
  async (window) => {
    console.log("SOY EL ONCREATED");
    console.log(window);
    console.log( "FIN DEL ONCREATED" );
    console.log("");
  }
);*/

//CUANDO PUERDE EL FOCUS DE LA VENTANA (IMPRIME EL ID DE LA VENTANA Y CUANDO SALE RETORNA UN -1)
/*chrome.windows.onFocusChanged.addListener(
  ( windowId ) => {
    console.log( "INICIA ONFOCUSCHANGED" );
    console.log( windowId ); 
    console.log( "FIN ONFOCUSCHANGED" );
  },
  {
    windowType: ['popup'] 
  }
);*/

/*chrome.windows.onRemoved.addListener(
  (windowId) => {
    console.log("Se eliminó la ventana " + windowId);
    // console.windows.get(windowId);
  }
);*/

//CICLO DE TABS
/*chrome.tabs.onCreated.addListener(
  ( tab ) => {
    let bandType;
    console.log( "SE CREÓ EL TAB" );
    console.log( tab );
    //if(tab.status == "loading"){
     // console.log("El status es loading");
    //}
     console.log( "FIN DEL ONCREATED TAB" );
     console.log( "" );
   }
 );*/



 /*chrome.storage.onChanged.addListener(
  ( changes, areaName ) => {
    console.log( "INICIA STORAGE.ONCHANGED" );
    console.log(changes);
    console.log(areaName);
    console.log( "FIN DE STORAGE.ONCHANGED" );
    console.log( "" );
  }
);*/

/*chrome.runtime.onInstalled.addListener( ()=>{
  console.log( "Me estoy activando" );
} );*/

/*chrome.runtime.onStartup.addListener(
  () =>{
    console.log("Hola mundooooo");
  }
);*/


 async function getWindowsInit(windowId){
  let mio = false;
  let promesaWindows = chrome.windows.getAll();
  await promesaWindows.then(value => {
      if(value.length > 1){
        if(value[0].id ===  windowId){
          mio = true;
        }
      }
    });
    return mio;
}

async function cerrarWindow(windowId){
  chrome.windows.remove(windowId);
}

async function crearPopUp(url){
  console.log("Creando el PopUp " + url);
  chrome.windows.create(
    {
      focused: true,
      url : url,
      type: "popup"
    }
  );
}