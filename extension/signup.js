

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
//firebase.auth().signInWithCredential(credential);
document.getElementById("firebase_signin").addEventListener('click', function(){
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
     //   var token = result.credential.accessToken;
      //  console.log(token)
        // The signed-in user info.
     
      //  console.log(user)
     // alert("Welcome to Netsips!");
    document.getElementsByClassName("login100-form-title")[0].innerText = "You are signed in!"
      
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

