//The favicon and the title
chrome.tabs.getSelected(null,function(tab) { 
    var title = tab.title; 
    var url = tab.url;
    var favicon = "https://s2.googleusercontent.com/s2/favicons?domain_url="+url 
    document.getElementById("modal-content").innerHTML = "<p id='website-title'>" + `<span ><img style="height:15px; width:15px; margin-left:-0.5px" src=${favicon}/></span>`+title+"</p>";
    
  });


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
var db = firebase.firestore();


var image 
function onPageDetailsReceived(pageDetails) {
  if(pageDetails.word_count>1000){
    document.getElementById('word_count').style.color = "red"
  }
    document.getElementById('url').value = pageDetails.url;
    document.getElementById('word_count').innerText =  " "+ pageDetails.word_count;
    if(pageDetails.estimated_time==1){
      document.getElementById('est_time').innerText = "(around "+ pageDetails.estimated_time+" minute)";
    }else{
      document.getElementById('est_time').innerText = "(around "+ pageDetails.estimated_time+" minutes)";
    }
  image = pageDetails.img_url
}



function update(array, webdata)
 {
  array.push(webdata);
  chrome.storage.local.set({ 
      list:array
  });
  }

function addBookmark() {
var d = new Date();     
var date = d.getUTCDate();
var month = d.getUTCMonth() + 1; // Since getUTCMonth() returns month from 0-11 not 1-12
var year = d.getUTCFullYear();
     if(date.length==1){
        var dateStr = "0" + date + "/" + month + "/" ; //
     }else{
        var dateStr = date + "/" + month + "/" + year;
     }
   var url = document.getElementById('url');
  var fav_icon = "https://s2.googleusercontent.com/s2/favicons?domain_url="+ url.value
    var uid = document.getElementById("uid");
    var website_title =  document.getElementById('website-title').innerText;
    var short_web_title
    var doc_id
    if(website_title.length>=60){
      short_web_title = website_title.substring(0, 60) + '...'
    }else{
      short_web_title = website_title
    }
    var tags = document.getElementById("popup_tags").value
    var web_details  
   event.preventDefault();


//     // The URL to POST our data to
//     var postUrl = 'http://netsips.in/script.php';
//     // Set up an asynchronous AJAX POST request
//     var xhr = new XMLHttpRequest();
//     xhr.open('POST', postUrl, true);

//     // Prepare the data to be POSTed by URLEncoding each field's contents


//      /********DO NOT REMOVE THIS CODE AT ANY COST********/


//     // chrome.storage.local.set({ "email_": '' });
//     // var email = document.getElementById('email');
//     // chrome.storage.local.set({ "email_": document.getElementById('email').value });
     
    
//     /* ******************************************************** */
//     // var url = document.getElementById('url');
//     // var uid = document.getElementById("uid");
// //    console.log(url)

//     var params = 'email=' + encodeURIComponent(email.value) +
//                  '&url=' + encodeURIComponent(url.value) +
//                  '&uid=' + encodeURIComponent(uid.value)
//    // console.log(params)      
              

//     // Replace any instances of the URLEncoded space char with +
//     params = params.replace(/%20/g, '+');

//     // Set correct header for form data
//     var formContentType = 'application/x-www-form-urlencoded';
//     xhr.setRequestHeader('Content-type', formContentType);

//     // Handle request state change events
//     xhr.onreadystatechange = function() {
//         // If the request completed
//         if (xhr.readyState == 4) {
//             statusDisplay.innerHTML = '';
//             if (xhr.status == 200) {
//                 // If it was a success, close the popup after a short delay
//                 statusDisplay.value = 'Saved!';
//                 window.setTimeout(window.close, 1000);
                
//        // chrome.browserAction.setIcon({path:"gt.png"});
//             } else {
//                 // Show what went wrong
//                 statusDisplay.value = 'Error saving' + xhr.statusText;
//             }
//         }
//     };

//     // Send the request and set status
//     xhr.send(params);
//     statusDisplay.value = 'Saving...';


var statusDisplay = document.getElementById('save');
chrome.storage.local.get(['key'], function(result) {
  db.collection(result.key).add({      //.doc().set({  //website_title
    status: "none",
    tags: tags,
    title: website_title,
    imageURL:image, //img
    dateAdded: firebase.firestore.Timestamp.now(), //timestamp
    articleURL: url.value //url
  }).then(function(docRef) {
    doc_id = docRef.id
    web_details = {URL:url.value, Title:short_web_title, Date:dateStr,Icon:fav_icon, Tags:tags, Complete_Title:website_title, DocId: doc_id };
   chrome.storage.local.get({ 
    list:[] 
  },
  function(data) {
   update(data.list, web_details); 
  }
  );  

    statusDisplay.value = "Saved!"
    setTimeout(function(){ 
      window.close(); 
    }, 800);
    
  })
  .catch(function(error) {
    console.error("Error writing document: ", error);
  });
});
 
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    statusDisplay = document.getElementById('save');
    // Handle the bookmark form submit event with our addBookmark function
    document.getElementById('addbookmark')
            .addEventListener('submit', addBookmark);

    
   
    chrome.runtime.getBackgroundPage(function(eventPage) {
        
        // Call the getPageInfo function in the event page, passing in
        // our onPageDetailsReceived function as the callback. This
        // injects content.js into the current tab's HTML

     /********DO NOT REMOVE THIS CODE AT ANY COST********/


            // chrome.storage.local.get('email_', function(data){
            //     let email = data.email_;
            //     if(!email){
            //         email = "";
            //     }
            //     document.getElementById("email").value =  email;
            //     })
     
     
     /* ******************************************************** */
        eventPage.getPageDetails(onPageDetailsReceived);
    });
});


(function () {
    var otherWindows = chrome.extension.getBackgroundPage();
    document.getElementById("email").value = otherWindows.user_email;
    document.getElementById("uid").value = otherWindows.user_id;

    
})();

//Settings page open on click


document.getElementById('settings-icon').addEventListener('click', function(){
    window.open('chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/settings.html', '_blank');
})






























