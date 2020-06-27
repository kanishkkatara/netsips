
var firebaseConfig = {
  apiKey: "AIzaSyBDaQL21llq2-5ftbSh0WvC243M6p_ZsgY",
  authDomain: "netsips-1586535958950.firebaseapp.com",
  databaseURL: "https://netsips-1586535958950.firebaseio.com",
  projectId: "netsips-1586535958950",
  storageBucket: "netsips-1586535958950.appspot.com",
  messagingSenderId: "617103322863",
  appId: "1:617103322863:web:4fbe39c3ad6acf34f3f51a",
  measurementId: "G-E4SH3K42ZY"
};
firebase.initializeApp(firebaseConfig);
// This function is called onload in the popup code
function getPageDetails(callback) {
  // Inject the content script into the current page
  chrome.tabs.executeScript(null, {
    file: 'content.js'
  });
  // When a message is received from the content script
  chrome.runtime.onMessage.addListener(function (message) {
    // Call the callback function
    callback(message);
 //   console.log(message.title)
  });
};


chrome.storage.local.get(['isSigned'], function (result) {

  if (result.isSigned) {
    chrome.browserAction.setPopup({
      popup: "popup_main.html"
    });
  } else {
     chrome.browserAction.setPopup({
      popup: "popup_main.html"
    });
  }
});



chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  //
  // chrome.storage.local.set({isSigned: request.isSigned})
  // chrome.storage.local.set({isSigned: request.key})
  // chrome.storage.local.set({isNew: request.isNew})
  //
if(sender.url=='http://netsips.in/whatsapp.html'){
//  console.log(sender.url)
  let db_rtd = firebase.database();
  let rtd  = db_rtd.ref();
    chrome.storage.local.get(['key'], function(result) {
      if(result.key){
        rtd.child(result.key).update({'phone': request.phone})
      }
    
    }); 
    chrome.storage.local.set({isWhatsApp: true})  
    chrome.storage.local.set({phone: request.phone})  
}
// else if(sender.url=='http://localhost:5500/dashboard.html'){
// //  console.log(sender.url)
//     chrome.storage.local.set({isSigned: request.isSigned})
//   chrome.storage.local.set({key: request.key})
//   chrome.storage.local.set({isNew: request.isNew})
// //  console.log(request.isSigned,  request.key)
// if(request.isSigned){
//  // console.log('Main')
//   chrome.browserAction.setPopup({
//     popup: "popup_main.html"
//   });
// }else{
// //  console.log('Not main')
//   chrome.browserAction.setPopup({
//     popup: "popup.html"
//   });
// }

// }

})


// chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  
//   chrome.storage.local.set({isSigned: request.isSigned})
//   chrome.storage.local.set({isSigned: request.key})
//   chrome.storage.local.set({isNew: request.isNew})
  

// })

chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
    window.open('chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/settings.html');
  }
});

chrome.tabs.onCreated.addListener(function(tab) {
  chrome.storage.local.get(['isHome','isSigned'], function(result){
    if (tab.title === 'New Tab' && result.isHome && result.isSigned) {
      chrome.tabs.update(tab.id, {url:'chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/new.html'});
    } 
  })
 
});
