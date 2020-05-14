
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

function title_trimmer(website_title){
  if(website_title.length>=60){
  website_title = website_title.substring(0, 60) + '...'
  }else{
  website_title = website_title
  }
  return website_title
}

function date_processing(d){
      //var d = new Date(); 
  var dateStr    
  var date = d.getDate();
  var month = d.getMonth() + 1; 
  var year = d.getFullYear();
      if(date.length==1){
           dateStr = "0" + date + "/" + month + "/" ; 
      }else{
           dateStr = date + "/" + month + "/" + year;
      }
   return dateStr   
}

function update(array, webdata)
 {
  array.push(webdata);
  chrome.storage.local.set({ 
      list:array
  });
  }

var favicon = "https://s2.googleusercontent.com/s2/favicons?domain_url=" 


function tag_trimmer(a){return a.trim()}

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}


chrome.storage.local.get(['key'], function(result){
    let uid= result.key 
    let db_store = firebase.firestore()
    db_store.collection(uid).onSnapshot(function(snapshot) {
     document.getElementById('news-content').innerHTML = ''
         db_store.collection(uid).orderBy('dateAdded',"desc").get().then(querySnapshot => {
          let  markers =[]
          querySnapshot.docs.forEach(doc => {            
          if(doc.data().status!=102){ 
        let url = doc.data().articleURL
        let title = title_trimmer(doc.data().title)
        let time = date_processing(doc.data().dateAdded.toDate())
        let icon = favicon+url 
        let link_tag_name = doc.data().tags
        let key = doc.id
        let img = doc.data().imageUrl
       document.getElementById('news-content').innerHTML += `<div class='column'> <div></div><div class='card' style="background:linear-gradient(rgba(255,255,255,.82), rgba(255,255,255,.82)), url(${img});background-size: contain;"><div class="topcorner"><img src="images/close.png" style="height:13px;width:13px;opacity:70%"/></div><img src="images/tag_icon.png" class="edit"><a href=${url} target="_blank" class='news-link'><div class="saved_article_titles">${title}</div></a><p class="card_logo"><img src=${icon} style="opacity:100%"/></p><p class="card_date">${time}</p><div style='display:none'class="card_tags">${link_tag_name}</div><div class="key" style="display:none">${key}</div></div></div>`       
       markers.push(link_tag_name)
      }
    //  if(document.getElementsByClassName('topcorner').length==0 || document.getElementsByClassName('topcorner').length==undefined ){
    //   document.getElementById('news-content').innerHTML = "<center style='margin:40px 40px 40px 0px;font-size:30px;color:#202020'>There are no bookmarks</center>"
    //  }
   for(var j=0;j<document.getElementsByClassName('topcorner').length;j++){
    
     let key
     key = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[6].innerText
     document.getElementsByClassName('topcorner')[j].onclick = function(){hellocard1(key, uid)}
   }
   
   for(var j=0;j<document.getElementsByClassName('edit').length;j++){
    let key
    let card_tags
    key = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[6].innerText
    card_tags = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[5].innerText
    document.getElementsByClassName('edit')[j].onclick =  function(){tags1(key, uid, card_tags)}}


    // if(document.getElementsByClassName('topcorner').length==0 || document.getElementsByClassName('topcorner').length==undefined ){
    //   document.getElementById('news-content').innerHTML = "<center style='margin:40px 40px 40px 0px;font-size:30px;color:#202020'>There are no bookmarks</center>"
    //  }
     
 }
 
 )
  
  tag_render(markers.filter(onlyUnique).map(s=>s.split(',')).join().toLowerCase().split(',').map(tag_trimmer).filter(onlyUnique))
  var filter_tags = document.getElementsByClassName("filter_tags")
  for(var i=0;i<filter_tags.length;i++){
    filter_tags[i].addEventListener('click', activeTag)
  }                            
          })  
    }
    )
   
  })
  
const hellocard1=(key, uid)=>{
 console.log(key, uid)
  
  let db = firebase.firestore();
  db.collection(uid).doc(key).update({
    status: 102  
   }).then(function() {
   }).catch(function(error){
     console.error("Error updating document: ", error);
   });
  
 }

const tags1 = (key, uid,card_tags)=>{
 let modal = document.getElementsByClassName("myModal")[0];
 modal.childNodes[3].childNodes[6].value = key //input title value //card_title
 modal.childNodes[3].childNodes[12].value = card_tags //input tag value
 modal.style.display = "block";
 let cross = document.getElementsByClassName("myModal")[0].childNodes[3].childNodes[1]
 cross.addEventListener("click",removeModal1)
 document.getElementById("make_changes_input").onclick = function(){addTags1(uid, key)}
}

function removeModal1(){
  this.parentElement.parentElement.style.display = "none"
} 

const tag_render = (tags)=>{

  document.getElementById("span_container").innerHTML = ''
      tags.forEach(tag=>{
        if(tag!=''){
        document.getElementById("span_container").innerHTML += `<span class="filter_tags" style="background-color: #f1f1f1;">${tag}</span>`
        }  
      })
}


const addTags1 =(uid, key)=>{
  let db = firebase.firestore();
  submit_btn = document.getElementById("make_changes_input")
  submit_btn.value = " Saving..." 
  let modal = document.getElementsByClassName("myModal")[0];
  let new_tags = document.getElementById('tag_input').value 
  db.collection(uid).doc(key).update({
    tags: new_tags
   })
   .then(function() {
    submit_btn.value = "Saved!"
    modal.style.display = "none";
   })
   .catch(function(error){
     console.error("Error updating document: ", error);
   });  
}

//Profile picture//
var p = document.getElementsByClassName('profile-picture')
var photo_link
 chrome.storage.local.get(['profile_pic'], function(result) {
   photo_link =  result.profile_pic
   for(var i=0;i<p.length;i++){
  //  console.log(p[i])
    p[i].src = photo_link 
  }
});

//SIDEMENU//

var buttons
buttons = document.getElementsByTagName('button')

buttons[0].addEventListener('click', function(){
    document.getElementById("London").style.display = "none"
    document.getElementById("Paris").style.display = "block"
})


buttons[1].addEventListener('click', function(){
    document.getElementById("London").style.display = "block"
  document.getElementById("Paris").style.display = "none"
 
})

// var db = firebase.firestore();
document.getElementById("SignOut").addEventListener('click', function(){
  this.innerText = "Signing out..."
  firebase.auth().signOut().then(function() {
    
    chrome.browserAction.setPopup({popup: "popup.html"});
    chrome.storage.local.set({isSigned: false}, function() {
    });
    setTimeout(function(){ 
      window.close('chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/settings.html') 
    }, 1000);
   
  }).catch(function(error) {
    console.log("An error happened."+error)
  });
 
})

/////SETTINGS MENU/////

///SAVED SETTINGS///

document.getElementById("custom").addEventListener('click', function() {
    // Get the checkbox
    var checkBox = document.getElementById("custom");
    // Get the output text
    var text = document.getElementById("days-menu");
  
    // If the checkbox is checked, display the output text
    if (checkBox.checked == true){
      text.style.display = "block";
    } else {
      text.style.display = "none";
    }
  }
)
document.getElementById("weekly").addEventListener('click', function() {
    // Get the checkbox
    var checkBox = document.getElementById("custom");
    // Get the output text
    var text = document.getElementById("days-menu");
  
    // If the checkbox is checked, display the output text
    if (checkBox.checked == true){
      text.style.display = "block";
    } else {
      text.style.display = "none";
    }
  }
)
document.getElementById("daily").addEventListener('click', function() {
    // Get the checkbox
    var checkBox = document.getElementById("custom");
    // Get the output text
    var text = document.getElementById("days-menu");
  
    // If the checkbox is checked, display the output text
    if (checkBox.checked == true){
      text.style.display = "block";
    } else {
      text.style.display = "none";
    }
  }
)
document.getElementById('submit-settings').addEventListener('submit',function(){

 event.preventDefault();
   
    var otherWindows = chrome.extension.getBackgroundPage();
    var email = otherWindows.user_email;
    var uid 
    var uid = otherWindows.user_id;
    var inputs = document.getElementsByTagName('input');
    var radios = [];
    var checkboxes = [];
    for(var i=0;i<inputs.length;i++){
        if(inputs[i].type == "radio"){
            radios.push(inputs[i])
        }
    }
    for(var i=0;i<inputs.length;i++){
        if(inputs[i].type == "checkbox"){
            checkboxes.push(inputs[i])
        }
    }
    var options = '';
    for(var i=0;i<radios.length;i++){
        if(radios[i].checked==true && radios[i].id!="custom"){
            options = radios[i].value
        }
        else if(radios[i].checked==true && radios[i].id=="custom"){
            for(var j=0;j<checkboxes.length;j++){
                if(checkboxes[j].checked==true){
                    options = options + String(checkboxes[j].value)  + " "
                }
            }
        }
    }

   var db_rtd = firebase.database();
   var rtd  = db_rtd.ref();

   

 chrome.storage.local.get(['key'], function(result) {
     rtd.child(result.key).update({'days': options })
   });

    alert("Your settings have been saved!")
   

})




function activeTag(){
  if(this.style.backgroundColor == "rgb(241, 241, 241)"){
    this.style.backgroundColor = "rgb(255, 255, 0)" // the rgb value string is sensitive to spaces
    filter_tag_collector()
  }
  else{
    this.style.backgroundColor = "rgb(241,241,241)"
    filter_tag_collector()
  }


}
function filter_tag_collector(){
  var tag_spans = document.getElementsByClassName("filter_tags")
  var filter_tags = []
  for(var i=0;i<tag_spans.length;i++){
   if(tag_spans[i].style.backgroundColor=="rgb(255, 255, 0)"){
        filter_tags.push(tag_spans[i].innerText)
   }
  }
  real_tag_filter(filter_tags)
}


let checker = (arr, target) => target.every(v => arr.includes(v)); //DO NOT REMOVE THIS



function real_tag_filter(list){

   var cards = document.getElementsByClassName("card")
  for(var i=0;i<cards.length;i++){
    var tag = cards[i].childNodes[5].innerText.toLowerCase().split(",")
    for(var k=0;k<tag.length;k++){
      tag[k] = tag[k].trim()
    }
   // console.log(tag, list, checker(tag,list))
    if(checker(tag,list)){
      cards[i].style.display=''
    }
    else{
      cards[i].style.display="none"
    }
  }
}


///////SEARCHBAR/////

window.addEventListener('load', function(){
  document.getElementById('searchBar').addEventListener('keyup',function(){
     var input = document.getElementById("searchBar");
     var filter = input.value.toUpperCase();
    var cards = document.getElementsByClassName('card')
    for(var j=0;j<cards.length;j++){
        txtValue = cards[j].childNodes[2].innerText
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          cards[j].style.display = "";
      } else {
        cards[j].style.display = "none";
      }
    }
  })


})


//See you later...//