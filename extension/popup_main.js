//The favicon and the title
chrome.tabs.getSelected(null,function(tab) { 
    var title = tab.title; 
    var url = tab.url;
    var favicon = "https://s2.googleusercontent.com/s2/favicons?domain_url="+url 
    document.getElementById("modal-content").innerHTML = "<p id='website-title'>" + `<span ><img style="height:15px; width:15px; margin-left:-0.5px" src=${favicon}/></span>`+title+"</p>";
    
  });

////

////
  
// This callback function is called when the content script has been
// injected and returned its results
//var text_to_speak = ''

function onPageDetailsReceived(pageDetails) {
  //  console.log(pageDetails.title)
    document.getElementById('url').value = pageDetails.url;
    document.getElementById('word_count').innerText = "Number of words:"+ " "+ pageDetails.word_count;
    document.getElementById('est_time').innerText = "Estimated reading time:"+ " "+ pageDetails.estimated_time+" min";
   // text_to_speak = pageDetails.content
    //console.log(text_to_speak)



}
// if(text_to_speak!=''){
//     console.log(text_to_speak)
// }
//TTS Play
// document.getElementById('play').addEventListener('click', function(){
//     var synth = window.speechSynthesis;
//     var utterThis = new SpeechSynthesisUtterance(text_to_speak);
//     synth.speak(utterThis);
//     synth.pause();
// })
//TTS Pause
// document.getElementById('pause').addEventListener('click', function(){
//    var synth = window.speechSynthesis;
//     var utterThis = new SpeechSynthesisUtterance(" ");
//     synth.pause();
// })
/*************************************************************************/


function update(array, webdata)
 {
 // var url = document.location.href;
  array.push(webdata);
  chrome.storage.local.set({ //chrome.storage.sync.set
      list:array
  });
  }



/*************************************************************************/
// Global reference to the status display SPAN

var statusDisplay = null;

// POST the data to the server using XMLHttpRequest





function addBookmark() {
    
  // var list_of_months = ["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"]
    // Cancel the form submit
   // alert(document.getElementById('website-title').innerText)
   var d = new Date();
     
var date = d.getUTCDate();
var month = d.getUTCMonth() + 1; // Since getUTCMonth() returns month from 0-11 not 1-12
var year = d.getUTCFullYear();
     if(date.length==1){
        var dateStr = "0" + date + "/" + month + "/" ; //
     }else{
        var dateStr = date + "/" + month + "/" + year;
     }
    

   // var dateStr = dateStr.substring(0,dateStr.length-4) + dateStr.substring(dateStr.length-2,dateStr.length)


   var url = document.getElementById('url');
  var fav_icon = "https://s2.googleusercontent.com/s2/favicons?domain_url="+ url.value
    var uid = document.getElementById("uid");
    var website_title =  document.getElementById('website-title').innerText;
    if(website_title.length>=60){
        website_title = website_title.substring(0, 60) + '...'
    }
  // var time_to_read =  document.getElementById('est_time').innerText.replace("Estimated reading time: ", "");
    
   //   console.log({website_title})
    var tags = ""
    var web_details = {URL:url.value, Title:website_title, Date:dateStr,Icon:fav_icon, Tags:tags};

    // console.log(JSON.stringify(web_details))
     
  chrome.storage.local.get({ 
    list:[] 
  },
  function(data) {
  
   update(data.list, web_details); 
  
   
  }
  );  








    event.preventDefault();

    // The URL to POST our data to
   //var postUrl = 'http://localhost/db2/script.php';
    var postUrl = 'http://netsips.in/script.php';
    // Set up an asynchronous AJAX POST request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', postUrl, true);

    // Prepare the data to be POSTed by URLEncoding each field's contents


     /********DO NOT REMOVE THIS CODE AT ANY COST********/


    // chrome.storage.local.set({ "email_": '' });
    // var email = document.getElementById('email');
    // chrome.storage.local.set({ "email_": document.getElementById('email').value });
     
    
    /* ******************************************************** */
    // var url = document.getElementById('url');
    // var uid = document.getElementById("uid");
//    console.log(url)

    var params = 'email=' + encodeURIComponent(email.value) +
                 '&url=' + encodeURIComponent(url.value) +
                 '&uid=' + encodeURIComponent(uid.value)
   // console.log(params)      
              

    // Replace any instances of the URLEncoded space char with +
    params = params.replace(/%20/g, '+');

    // Set correct header for form data
    var formContentType = 'application/x-www-form-urlencoded';
    xhr.setRequestHeader('Content-type', formContentType);

    // Handle request state change events
    xhr.onreadystatechange = function() {
        // If the request completed
        if (xhr.readyState == 4) {
            statusDisplay.innerHTML = '';
            if (xhr.status == 200) {
                // If it was a success, close the popup after a short delay
                statusDisplay.value = 'Saved!';
                window.setTimeout(window.close, 1000);
                
       // chrome.browserAction.setIcon({path:"gt.png"});
            } else {
                // Show what went wrong
                statusDisplay.value = 'Error saving' + xhr.statusText;
            }
        }
    };

    // Send the request and set status
    xhr.send(params);
    statusDisplay.value = 'Saving...';

  
 
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
    //document.getElementById('email').value = " ";
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('save');
    // Handle the bookmark form submit event with our addBookmark function
    document.getElementById('addbookmark')
            .addEventListener('submit', addBookmark);

    
    // Get the event page
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
    // console.log(otherWindows.user_email)
    // console.log(otherWindows.user_id)
    
})();
// var otherWindows = chrome.extension.getBackgroundPage();
// var token = otherWindows.auth
// console.log(token)

//Settings page open on click


document.getElementById('settings-icon').addEventListener('click', function(){
    window.open('chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/settings.html', '_blank');
    //window.location.href = "chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/webpage.html";
})






























