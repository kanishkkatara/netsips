//The favicon and the title
chrome.tabs.getSelected(null,function(tab) { 
    var title = tab.title; 
    var url = tab.url;
    var favicon = "https://s2.googleusercontent.com/s2/favicons?domain_url="+url 
    document.getElementById("modal-content").innerHTML = "<p id='website-title'>" + `<span ><img style="height:16px; width:16px; margin-left:-0.5px" src=${favicon}/></span>`+title+"</p>";
    
  });


var recent = document.getElementById('recent-container') 
//Firebase
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
 
chrome.storage.local.get(['key'], function(result){
  let i = 0
  var icon_link = "https://s2.googleusercontent.com/s2/favicons?domain_url="
  db.collection(result.key).orderBy('dateAdded',"desc").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
       if(doc.data().status!=102 && i<3){
         let recent_title
         let fav
         if(doc.data().title.length>60){
              recent_title = doc.data().title.substring(0,70)+'...'
         }else{
          recent_title = doc.data().title
         }
         fav = icon_link + doc.data().articleURL
         recent.innerHTML += `<tr><td style='border-bottom: 1px solid #dddddd;'><img style="height:15px; width:15px; margin-left:15px" src=${fav}/></td><td class='recent' style='border-bottom: 1px solid #dddddd;'><a href=${doc.data().articleURL}>${recent_title}</a></td></tr>`
         i++
       }
     
    });
    for(let x=0;x<3;x++){
    let link = document.getElementsByClassName('recent')[x].childNodes[0].href
    document.getElementsByClassName('recent')[x].onclick = function(){linkopener(link)}
    } 

});
})

for(let x=0;x<document.getElementsByClassName('recent');x++){
  console.log( document.getElementsByClassName[x])
  document.getElementsByClassName[x].addEventListener('click', linkopener)
}

const linkopener = (link)=>{
  window.open(link, '_blank');
}

document.getElementById('drop-menu').addEventListener('click', checkdropy)


function checkdropy(){  
  if(document.getElementById('recent-container').style.display =='block'){
    document.getElementById('recent-container').style.display ='none'
    this.childNodes[0].src = 'images/arrow-down.svg'
  }
    else{
      document.getElementById('recent-container').style.display ='block'
      this.childNodes[0].src = 'images/arrow-up.svg'
    }
}

window.addEventListener('load', function(){
  let drop_down = document.getElementById('drop-menu')
  // console.log(drop_down)
  chrome.storage.local.get(['recentisOpen'], function(result) {
  if(result.recentIsOpen){
    document.getElementById('recent-container').style.display ='block'
    drop_down.childNodes[0].src = 'images/arrow-up.svg'
  }else{
    document.getElementById('recent-container').style.display ='none'
    drop_down.childNodes[0].src = 'images/arrow-down.svg'
  }})
  
})


//Delivery from content.js
var image
var website_url
function onPageDetailsReceived(pageDetails) {
  if(pageDetails.word_count>1000){
    document.getElementById('word_count').style.color = "red"
  }
 //   document.getElementById('url').value = pageDetails.url;
 website_url = pageDetails.url;
    document.getElementById('word_count').innerText =  " "+ pageDetails.word_count;
    if(pageDetails.estimated_time==1){
      document.getElementById('est_time').innerText = "(around "+ pageDetails.estimated_time+" minute)";
    }else{
      document.getElementById('est_time').innerText = "(around "+ pageDetails.estimated_time+" minutes)";
    }
image = pageDetails.img_url
}


//This method is holding this entire app together
function update(array, webdata)
 {
  array.push(webdata);
  chrome.storage.local.set({ 
      list:array
  });
  }

function addBookmark() {
var d = new Date();    
var date = d.getDate();
var month = d.getMonth() + 1; 
var year = d.getFullYear();
     if(date.length==1){
        var dateStr = "0" + date + "/" + month + "/" ; //
     }else{
        var dateStr = date + "/" + month + "/" + year;
     }
  // var url = document.getElementById('url');
  var fav_icon = "https://s2.googleusercontent.com/s2/favicons?domain_url="+ website_url
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



// 100- in current session, 101- newsletter sent, 102- deleted   
var statusDisplay = document.getElementById('save');
statusDisplay.value = "Saving..."
chrome.storage.local.get(['key'], function(result) {
  db.collection(result.key).add({      //.doc().set({  //website_title
    status: 100,  //none
    tags: tags,
    title: website_title,
    imageUrl:image, //img
    dateAdded: firebase.firestore.Timestamp.now(), //timestamp
    articleURL: website_url //url
  }).then(function(docRef) {
    doc_id = docRef.id
    statusDisplay.value = "Saved!"
    setTimeout(function(){ 
      window.close(); 
    }, 800);
    
  })
  .catch(function(error) {
    statusDisplay.value = "Error"
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
        eventPage.getPageDetails(onPageDetailsReceived);
    });
});


(
  function () {
    var otherWindows = chrome.extension.getBackgroundPage();
    document.getElementById("email").value = otherWindows.user_email;
    document.getElementById("uid").value = otherWindows.user_id;

    
})();

//Settings page open on click
document.getElementById('settings-icon').addEventListener('click', function(){
    window.open('chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/settings.html', '_blank');

})






























