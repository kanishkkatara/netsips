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

//Chrome Identity API
// var user_email
// var user_id
// chrome.identity.getProfileUserInfo(function (userinfo){
//     user_email  = userinfo.email
//     user_id = userinfo.id
//   })
// var auth
//   chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
//    auth = token
//   // console.log(auth)
//   });

// chrome.runtime.onInstalled.addListener(function(details){
//     if(details.reason == "install"){
       
//         var postUrl = 'http://netsips.in/settings.php';
//         var xhr = new XMLHttpRequest();
//         xhr.open('POST', postUrl, true);
//         xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//         var params = 'user_id=' + encodeURIComponent(user_id) +
//                      '&option=' + '6' +
//                      '&email=' + encodeURIComponent(user_email) 
       
//         params = params.replace(/%20/g, '+');
//         xhr.send(params);
//     }
// });

  

  

//Sending introductory mail on new install

// chrome.runtime.onInstalled.addListener(function(details){
//     if(details.reason == "install"){
//     alert("New install") ;
//     var postUrl = 'http://localhost/db2/email.php';
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', postUrl, true);
//     var params = 'email=' + encodeURIComponent(user_email);
//     var formContentType = 'application/x-www-form-urlencoded';
//     xhr.setRequestHeader('Content-type', formContentType);
//     xhr.send(params); 
//     }
//     else if(details.reason == "update"){
//         var thisVersion = chrome.runtime.getManifest().version;
//         console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
//     }
// });

 