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
  var db_store = firebase.firestore()

function title_trimmer(website_title){
    if(website_title.length>=60){
    website_title = website_title.substring(0, 60) + '...'
    }else{
    website_title = website_title
    }
    return website_title
}

function date_processing(){
        var d = new Date(); 
        var dateStr    
    var date = d.getDate();
    var month = d.getMonth() + 1; 
    var year = d.getFullYear();
        if(date.length==1){
             dateStr = "0" + date + "/" + month + "/" ; //
        }else{
             dateStr = date + "/" + month + "/" + year;
        }
     return dateStr   
}

var favicon = "https://s2.googleusercontent.com/s2/favicons?domain_url="
var web_details  

document.getElementById("firebase_signin").addEventListener('click', function(){


    firebase.auth().signInWithPopup(provider).then(function(result) {
    document.getElementById("firebase_signin").style.display = "none"    
  
    document.getElementsByClassName("login100-form-title")[0].innerText = "You are signed in! (check the popup)"
    chrome.storage.local.set({isSigned: true}, function() {
    });
    chrome.browserAction.setPopup({popup: "popup_main.html"});
    var email =  result.user.email
    var value = result.user.uid
    var profile_picture = result.user.photoURL
    chrome.storage.local.set({ 
      list:[]              
  }, function(items){
 
  });
    var markers = [];
    db_store.collection(value).get().then(querySnapshot => {
    querySnapshot.docs.forEach(doc => {
    if(doc.data().status!=102){ //"Deleted"
        var url = doc.data().articleURL
        var short_web_title = title_trimmer(doc.data().title)
        var dateStr = date_processing()
        var fav_icon = favicon+url 
        var tags = doc.data().tags
        var website_title = doc.data().title
        var doc_id = doc.id
        var img = doc.data().imageUrl
        web_details = {URL:url, Title:short_web_title, Date:dateStr,Icon:fav_icon, Tags:tags, Complete_Title:website_title, DocId: doc_id, BgImage:img };
        markers.push(web_details);   
    }     
  });

  if(markers.length!=0 && markers.length!=undefined)
  {  
      chrome.storage.local.set({ 
                list:markers              
            }, function(items){
           
            });
  
  }else{
     
      chrome.storage.local.set({ 
          list:[]
      });
  }
  



});

// RTD Initialize
var db = firebase.database();
var rtd  = db.ref();

rtd.once("value")
  .then(function(snapshot) {
    var hasName = snapshot.hasChild(value); 
    if(!hasName){
        rtd.child(value).set({'email':  email, 'days':"6"}).then().catch();
    }
  });

 chrome.storage.local.set({profile_pic: profile_picture}, function() {
});






// saving uid of user
    
    chrome.storage.local.set({key: value}, function() {
      });
    
      chrome.storage.local.get(['key'], function(result) {
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
        //console.log(errorCode, errorMessage,email, credential)
      });
}

)

