document.getElementById("ext_link").addEventListener('click', function(){
  window.open('chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/signup.html', '_blank');
  })

 // chrome.browserAction.setPopup({popup: "logged_in.html"});

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
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
//   firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//         chrome.browserAction.setPopup({popup: "popup_unlog.html"});
//       // console.log("F")
//     } else {
//         chrome.browserAction.setPopup({popup: "popup.html"});
//     }
//   });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      chrome.browserAction.setPopup({popup: "popup_main.html"});
    } else {
        chrome.browserAction.setPopup({popup: "popup.html"});
    }
});