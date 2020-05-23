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


    // chrome.storage.local.get(['isNew'], function(result) {

    //   if (result.isNew) {
    //       var postUrl = 'http://netsips.in/script.php';
    //       var xhr = new XMLHttpRequest();
    //       xhr.open('POST', postUrl, true);
    //       xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //       var params = '&email=' + encodeURIComponent(user_email) 
         
    //       params = params.replace(/%20/g, '+');
    //       xhr.send(params);
      
    //   }
    // });
