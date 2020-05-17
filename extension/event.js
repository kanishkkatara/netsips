// This function is called onload in the popup code
function getPageDetails(callback) {
    // Inject the content script into the current page
    chrome.tabs.executeScript(null, { file: 'content.js' });
    // When a message is received from the content script
    chrome.runtime.onMessage.addListener(function(message) {
        // Call the callback function
        callback(message);
    });
};

  chrome.storage.local.get(['isSigned'], function(result) {

      if (result.isSigned) {
        chrome.browserAction.setPopup({popup: "popup_main.html"});
      } else {
          chrome.browserAction.setPopup({popup: "popup.html"});
      }


    });

  chrome.runtime.onInstalled.addListener(function(details){
      if(details.reason == "install"){
        window.open('http://netsips.in/instructions.html' ,'_blank');
      }
  });
  







// });