
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
  });
};

chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  //console.log(request.phone)
let db_rtd = firebase.database();
let rtd  = db_rtd.ref();
  chrome.storage.local.get(['key'], function(result) {
    rtd.child(result.key).update({'phone': request.phone,'isWhatsApp': true })
  }); 
  chrome.storage.local.set({isWhatsApp: true})  
})



chrome.storage.local.get(['isSigned'], function (result) {

  if (result.isSigned) {
    chrome.browserAction.setPopup({
      popup: "popup_main.html"
    });
  } else {
    chrome.browserAction.setPopup({
      popup: "popup.html"
    });
  }
});