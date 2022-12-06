//IMPORTS. GRACIAS A MI 'TYPE: MODULE' DE MI MANIFEST
import {gdtSaveBaseUrl} from './GdtBrowserWindowSystem/WindowSystem.js';
import {gdtSaveUrl} from './GdtBrowserWindowSystem/WindowSystem.js';

//BACKGROUND DE MI EXTENSION

//LISTENER
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.command) {
    case "CLOSE":
        chrome.windows.getCurrent(function (w) {
        chrome.windows.remove(w.id);
      });
      break;
      default:
        //if(request.href === "https://www.elektra.mx"){
            
        //console.log("He caido en default1 \n" + request.href);
        //window.storage.local.set({firstKey : request.href})
            
        //}
        //console.log("He caido en default2 \n" + request.href);
        gdtBrowserPort.postMessage(request);
      break;
  }
});

gdtSaveBaseUrl(location.href);
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




//****************************************************   CODIGO POPUPS INTEGRACIÓN MV3  *********************************
let miVentana = "0";
let myKey;
let changeKey = "gdtKey";
let basUrl;
let windowTabs = 1;
let ventanas = [];
/*
 *[0] => Bandera para Windows
 *[1] => Bandera para Tabs
 *[2] => Bandera any 
 */
let bandSitesWeb = [false, false, false]

chrome.tabs.onUpdated.addListener( async function (tabId, changeInfo, tab) {
  let bandType;
  if( changeInfo.status === "loading" && changeInfo.url !== undefined ){
    console.log("INFORMACIÓN " + tab.url + " (status: " + changeInfo.status + " )");
    console.log("tabId    => " + tabId + "\n"+
                "windowId => " + tab.windowId + "\n" +
                "url      => " + tab.url);
    
    if(await validateTypeWindow(tab.windowId)){
      console.log("INIT La ventana es PopUp, procede a terminar");
      console.log("FIN INFORMACIÓN\n");
      console.log("");
      return;
    }
    
    // OBTENEMOS EL ARRAY DE WINDOWS
    await getWindows(tab.url, tab.windowId);

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


/*chrome.windows.onBoundsChanged.addListener(
  (window) => {
    console.log("En el onBoundsChanged")
    console.log(window);
    console.log("FIN ONBOUNDSCHANGED");
    // window.type = "popup"
    // console.log(window);
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

//VALIDAR LA VENTANA DE CREACION PARA ELIMINAR EL FOCUS
chrome.windows.onCreated.addListener(
  async (window) => {
    console.log("SOY EL ONCREATED");
    console.log(window);
    console.log( "Modificando el focus de la ventana" );
    console.log(await getWindowsInit(window.id));
    if(!await getWindowsInit(window.id)){
    // chrome.windows.update()
    if(window.type === "normal"){
      console.log("Es normal, se debe cerrar y crear una nueva");
      chrome.windows.update(window.id, { focused: false });
      chrome.windows.update(window.id, { state: 'minimized' });
    }
  }
    console.log( "FIN DEL ONCREATED" );
    console.log("");
  }
);

/*chrome.windows.onRemoved.addListener(
  (windowId) => {
    console.log("Se eliminó la ventana " + windowId);
    // console.windows.get(windowId);
  }
);*/

chrome.tabs.onCreated.addListener(
  ( tab ) => {
    let bandType;
    console.log( "SE CREÓ EL TAB" );
    if(tab.status == "loading"){
      console.log("El status es loading");
    }
    /*if(!await getWindows1(tab.windowId)){
      console.log("La ventana es diferente");
    }else if( validaTab( tab.id ) ){
      console.log("La ventana es la misma");
    }
    console.log(tab);
    let promesaTab = chrome.windows.get( tab.windowId );
    await promesaTab.then( value => { 
      console.log( "Este es el tipo de ventana" );
      console.log( value.type );
      console.log(value);
      bandType = value.type;
     } );*/
     /*if( bandType == "normal" ){
      console.log( "La ventana es normal, procedo a crear un popup y cerrarme" );
      await crearPopUp(tab.pendingUrl);
      // chrome.windows.create(
      //   {
      //     url : tab.pendingUrl,
      //     type: "popup"
      //   }
      // );
      console.log("Eliminando el tab");
      chrome.tabs.remove(tab.id);
     }
     else if( bandType == "popup" ){
      console.log( "La ventana es un popup, se mantiene" );
     }*/
     console.log(tab);
     console.log( "FIN DEL ONCREATED TAB" );
   }
 );

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