

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
  var provider = new firebase.auth.GoogleAuthProvider();
  var db = firebase.database();
document.getElementById("firebase_signin").addEventListener('click', function(){
    firebase.auth().signInWithPopup(provider).then(function(result) {
    
    document.getElementsByClassName("login100-form-title")[0].innerText = "You are signed in!"
    var email =  result.user.email
    var value = result.user.uid
 var rtd  = db.ref();
 rtd.child(value).set({'email':  email, 'days':"6"}).then().catch();
chrome.browserAction.setPopup({popup: "popup_main.html"});
    
    chrome.storage.local.set({key: value}, function() {
      //  console.log('Value is set to ' + value);
      });
    
      chrome.storage.local.get(['key'], function(result) {
     //   console.log('Value currently is ' + result.key);
      });
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode, errorMessage,email, credential)
      });
})

