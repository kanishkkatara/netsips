// Counting number of words and estimated reading time
var p = document.getElementsByTagName('p');
var h1 = document.getElementsByTagName('h1');
var count_p = 0;
var count_h = 0;
var count = 0;
for(var i=0;i<p.length;i++){
    count_p = count_p+p[i].innerText.split(" ").length
   }
for(var i=0;i<h1.length;i++){
    count_h = count_h+h1[i].innerText.split(" ").length
   }
count = count_p + count_h;
var av_reading_time = 190;   
var time = count/av_reading_time; 

// For TTS Feature
var content = '';
for(var i=0;i<p.length;i++){
    content = content + " " + p[i].innerText
}


// chrome.storage.local.set({ "total_time_saved": 0 });

// chrome.storage.local.get('total_time_saved', function(data){
//         let total_time_saved = data.total_time_saved;
//         total_time_saved = total_time_saved + time;
//         chrome.storage.local.set({ "total_time_saved": total_time_saved });
    
//         })


// Send a message containing the page details back to the event page
chrome.runtime.sendMessage({
 //    'title': document.title, //pls remove if creates trouble
     'url': window.location.href,
     'word_count': count,
     'estimated_time': Math.ceil(time),
     'content': content
    // 'total_time_saved': total_time_saved
     
 });
 
 
    // chrome.storage.local.set({ "email_": '' });
    // var email = document.getElementById('email');
    // chrome.storage.local.set({ "email_": document.getElementById('email').value });

    
            // chrome.storage.local.get('email_', function(data){
            //     let email = data.email_;
            //     if(!email){
            //         email = "";
            //     }
            //     document.getElementById("email").value =  email;
            //     })