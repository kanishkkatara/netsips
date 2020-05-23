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

chrome.storage.local.get(['isSigned'], function(result){
  if(!result.isSigned){
    document.getElementsByClassName('signModal')[0].style.display = 'block'
    document.getElementById('news-content').innerHTML = '' 
    let p = document.getElementsByClassName('profile-picture')
    for(let i=0;i<p.length;i++){
      p[i].style.display = "none"
    }
  }else{
 
    chrome.storage.local.get(['key'], function(result){
      let uid= result.key 
      // let dark = document.getElementById('dark_mode_checkbox')
   let db_store = firebase.firestore()
      db_store.collection(uid).onSnapshot(function(snapshot) {
       document.getElementById('news-content').innerHTML = ''
           db_store.collection(uid).orderBy('dateAdded',"desc").get().then(querySnapshot => {
            let  markers =[]
           // let marker_del = []
            querySnapshot.docs.forEach(doc => {            
            if(doc.data().status!=102){ 
          let url = doc.data().articleURL
          let title = title_trimmer(doc.data().title)
          let time = date_processing(doc.data().dateAdded.toDate())
          let icon = favicon+url 
          let link_tag_name = doc.data().tags
          let key = doc.id
          let img = doc.data().imageUrl
          document.getElementById('news-content').innerHTML += `<div class='column'> <div></div><div class='card' style="background:linear-gradient(rgba(240,240,240,.80), rgba(240,240,240,.80)), url(${img});background-size: contain;"><div class="topcorner"><img src="images/close.png" style="height:13px;width:13px;opacity:70%"/></div><img src="images/tag_icon.png" class="edit"><a href=${url} target="_blank" class='news-link'><div class="saved_article_titles">${title}</div></a><p class="card_logo"><img src=${icon} style="opacity:100%"/></p><p class="card_date">${time} </p><div style='display:none'class="card_tags">${link_tag_name}</div><div class="key" style="display:none">${key}</div></div></div>`       
          markers.push(link_tag_name)
        }
     for(var j=0;j<document.getElementsByClassName('topcorner').length;j++){
      
       let key
       key = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[6].innerText
      
       document.getElementsByClassName('topcorner')[j].onclick = function(){
        hellocard1(key, uid)}
     }
     
     for(var j=0;j<document.getElementsByClassName('edit').length;j++){
      let key
      let card_tags
      let card_title
      key = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[6].innerText
      card_tags = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[5].innerText
      card_title = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[2].innerText
      document.getElementsByClassName('edit')[j].onclick =  function(){tags1(key, uid, card_tags, card_title)}}
       
   }
   
   )
    //tags rendering 
    tag_render(markers.filter(onlyUnique).map(s=>s.split(',')).join().toLowerCase().split(',').map(tag_trimmer).filter(onlyUnique))
    // tags rendering
    var filter_tags = document.getElementsByClassName("filter_tags")
    for(var i=0;i<filter_tags.length;i++){
      filter_tags[i].addEventListener('click', activeTag)
    }                            
            })  
      }
      )
     
    })
  
  }
})

document.addEventListener('DOMContentLoaded',()=>{
  chrome.storage.local.get(['isDark'], function(result) {
    if(result.isDark){
      document.getElementById('dark_mode_checkbox').checked = true
      
      make_dark()
    }else{
      document.getElementById('dark_mode_checkbox').checked = false
      make_light()
    }
    
  });
  
})


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








//SIGNUP
document.getElementById('signinbtn').addEventListener('click', function(){
 
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
    document.getElementsByClassName("signModal")[0].style.display = "none"   
    chrome.storage.local.set({isSigned: true}, function() {
    });
    chrome.browserAction.setPopup({popup: "popup_main.html"});
    var email =  result.user.email
    var value = result.user.uid
    var profile_picture = result.user.photoURL
    var new_user  = result.additionalUserInfo.isNewUser
    chrome.storage.local.set({isNew: new_user})

    chrome.storage.local.set({isDark: false})

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
//document.getElementsByClassName('profile-picture')[0].style.display = 'block'
let p = document.getElementsByClassName('profile-picture')
    for(let i=0;i<p.length;i++){
      p[i].style.display = "block"
    }
let photo_link
 chrome.storage.local.get(['profile_pic'], function(result) {
   photo_link =  result.profile_pic
   for(let i=0;i<p.length;i++){
  //  console.log(p[i])
    p[i].src = photo_link 
  }
});
    
    chrome.storage.local.set({key: value}, function() {
      });
 
  //   document.getElementById('news-content').innerHTML = '<div style="font-size:30px">The bookmarks you save using Netsips will appear here<div>'
  
  chrome.storage.local.get(['isNew'], function(result){
    if(result.isNew){
      document.getElementById('news-content').innerHTML = '<div style="font-size:30px">The bookmarks you save using Netsips will appear here<div>'
  
    }else{
  
      chrome.storage.local.get(['key'], function(result){
        let uid= result.key 
        // let dark = document.getElementById('dark_mode_checkbox')
     let db_store = firebase.firestore()
        db_store.collection(uid).onSnapshot(function(snapshot) {
         document.getElementById('news-content').innerHTML = ''
             db_store.collection(uid).orderBy('dateAdded',"desc").get().then(querySnapshot => {
              let  markers =[]
             // let marker_del = []
              querySnapshot.docs.forEach(doc => {            
              if(doc.data().status!=102){ 
            let url = doc.data().articleURL
            let title = title_trimmer(doc.data().title)
            let time = date_processing(doc.data().dateAdded.toDate())
            let icon = favicon+url 
            let link_tag_name = doc.data().tags
            let key = doc.id
            let img = doc.data().imageUrl
            document.getElementById('news-content').innerHTML += `<div class='column'> <div></div><div class='card' style="background:linear-gradient(rgba(240,240,240,.80), rgba(240,240,240,.80)), url(${img});background-size: contain;"><div class="topcorner"><img src="images/close.png" style="height:25px;width:25px;opacity:40%;"/></div><img src="images/tag_icon.png" class="edit"><a href=${url} target="_blank" class='news-link'><div class="saved_article_titles">${title}</div></a><p class="card_logo"><img src=${icon} style="opacity:100%"/></p><p class="card_date">${time} </p><div style='display:none'class="card_tags">${link_tag_name}</div><div class="key" style="display:none">${key}</div></div></div>`       
            markers.push(link_tag_name)
          }
       for(var j=0;j<document.getElementsByClassName('topcorner').length;j++){
        
         let key
         key = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[6].innerText
        
         document.getElementsByClassName('topcorner')[j].onclick = function(){
          hellocard1(key, uid)}
       }
       
       for(var j=0;j<document.getElementsByClassName('edit').length;j++){
        let key
        let card_tags
        let card_title
        key = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[6].innerText
        card_tags = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[5].innerText
        card_title = document.getElementsByClassName('topcorner')[j].parentElement.childNodes[2].innerText
        document.getElementsByClassName('edit')[j].onclick =  function(){tags1(key, uid, card_tags, card_title)}}
         
     }
     
     )
      //tags rendering 
      tag_render(markers.filter(onlyUnique).map(s=>s.split(',')).join().toLowerCase().split(',').map(tag_trimmer).filter(onlyUnique))
      // tags rendering
      var filter_tags = document.getElementsByClassName("filter_tags")
      for(var i=0;i<filter_tags.length;i++){
        filter_tags[i].addEventListener('click', activeTag)
      }                            
              })  
        }
        )
       
      })
    


    
    }
  })











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


  
})
//SIGNUP


var db = firebase.firestore();  

const hellocard1=(key, uid)=>{
// console.log(key, uid)  
 // let db = firebase.firestore();
  db.collection(uid).doc(key).update({
    status: 102  
   }).then(function() {
   }).catch(function(error){
     console.error("Error updating document: ", error);
   });
  
 }

const tags1 = (key, uid,card_tags, card_title)=>{
 let modal = document.getElementsByClassName("myModal")[0];
 if(card_title.length<42){
  modal.childNodes[3].childNodes[8].innerText = card_title
 }else{
  modal.childNodes[3].childNodes[8].innerText = card_title.substring(0,42)+'...'
 }
 
 modal.childNodes[3].childNodes[6].value = key //input title value //card_title
 modal.childNodes[3].childNodes[11].value = card_tags //input tag value
 modal.style.display = "block";
 let cross = document.getElementsByClassName("myModal")[0].childNodes[3].childNodes[1]
 cross.addEventListener("click",removeModal1)
 document.getElementById("make_changes_input").onclick = function(){addTags1(uid, key)}
}

function removeModal1(){
  this.parentElement.parentElement.style.display = "none"
} 


///HERE CHANGE//
const tag_render = (tags)=>{
  let dark = document.getElementById('dark_mode_checkbox')
  document.getElementById("span_container").innerHTML = ''
      tags.forEach(tag=>{
        if(tag!=''){
        if(dark.checked){
          document.getElementById("span_container").innerHTML += `<span class="filter_tags" style="background-color: #4c4e4d; color:white">${tag}</span>`        
        }else{
        document.getElementById("span_container").innerHTML += `<span class="filter_tags" style="background-color: #f1f1f1;">${tag}</span>`
        }
        }  
      })
}


const addTags1 =(uid, key)=>{
 // let db = firebase.firestore();
  submit_btn = document.getElementById("make_changes_input")
  submit_btn.value = "Saving..." 
  let modal = document.getElementsByClassName("myModal")[0];
  let new_tags = document.getElementById('tag_input').value 
  db.collection(uid).doc(key).update({
    tags: new_tags
   })
   .then(function() {
  
    modal.style.display = "none";
    submit_btn.value = "Saved!" 
    submit_btn.value = 'Add tags'
   })
   .catch(function(error){
     console.error("Error updating document: ", error);
   });  
}


const render_deleted = ()=>{
  
  chrome.storage.local.get(['key'], function(result){
        let uid = result.key
        let db = firebase.firestore()
        db.collection(uid).orderBy('dateAdded',"desc").get().then(docs=>{
          document.getElementById('deleted-content').innerHTML = ''
          docs.forEach(doc=>
            {
              if(doc.data().status==102){
        let url = doc.data().articleURL
        let title = title_trimmer(doc.data().title)
        let time = date_processing(doc.data().dateAdded.toDate())
        let icon = favicon+url 
        let link_tag_name = doc.data().tags
        let key = doc.id
        let img = doc.data().imageUrl
        document.getElementById('deleted-content').innerHTML += `<div class='column'> <div></div><div class='card' style="background:linear-gradient(rgba(240,240,240,.80), rgba(240,240,240,.80)), url(${img});background-size: contain;"><div class="topcorner1"><img src="images/bin.png" style="height:18px;width:18px;opacity:70%"/></div><img src="images/plus.png" class="edit1" style='height:15px;width:14px'><a href=${url} target="_blank" class='news-link'><div class="saved_article_titles">${title}</div></a><p class="card_logo"><img src=${icon} style="opacity:100%"/></p><p class="card_date">${time} </p><div style='display:none'class="card_tags">${link_tag_name}</div><div class="key" style="display:none">${key}</div></div></div>`
              }
            }
            
            )

   for(var j=0;j<document.getElementsByClassName('topcorner1').length;j++){
     let key
     key = document.getElementsByClassName('topcorner1')[j].parentElement.childNodes[6].innerText
     document.getElementsByClassName('topcorner1')[j].onclick = function(){     
     this.parentElement.parentElement.style.display = 'none'
    permanent_delete(key, uid)}
   }
   
   for(var j=0;j<document.getElementsByClassName('edit1').length;j++){
    let key
    key = document.getElementsByClassName('edit1')[j].parentElement.childNodes[6].innerText
    document.getElementsByClassName('edit1')[j].onclick = function(){     
    this.parentElement.parentElement.style.display = 'none'
 restore_card(key, uid)
}
  }


        })
  
  })
 
}

function permanent_delete(key, uid){
  db.collection(uid).doc(key).delete().then(function() {
}).catch(function(error) {
    console.error("Error removing document: ", error);
});
}

function restore_card(key, uid){
  db.collection(uid).doc(key).update({
    status: 100 
   }).then(function() {
   }).catch(function(error){
     console.error("Error updating document: ", error);
   });

}

const clearArchive = ()=>{
  document.getElementById('deleted-content').innerHTML = ''
  chrome.storage.local.get(['key'], function(result){
    let uid = result.key
    let db = firebase.firestore()
    db.collection(uid).get().then(docs=>{
      docs.forEach(doc=>{
        if(doc.data().status == 102){
          console.log(doc.id)
          db.collection(uid).doc(doc.id).delete()
        }
        
      })
      alert('All cleared!')

  })

})
// alert('hjbwdjbj')
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
    document.getElementById("Rome").style.display = 'none'
    document.getElementById("Paris").style.display = "block"
   
})


buttons[1].addEventListener('click', function(){
    document.getElementById("London").style.display = "block"
  document.getElementById("Paris").style.display = "none"
  document.getElementById("Rome").style.display = 'none'
 
})

buttons[2].addEventListener('click', function(){
  document.getElementById("London").style.display = "none"
document.getElementById("Paris").style.display = "none"
document.getElementById("Rome").style.display = 'block'
document.getElementById('Tag_search_button_del').onclick = function(){
   clearArchive()
  }
render_deleted()

})

// var db = firebase.firestore();
document.getElementById("SignOut").addEventListener('click', function(){
  this.innerText = "Signing out..."
  firebase.auth().signOut().then(function() {
    document.getElementById('Paris').innerHTML = ''
    chrome.browserAction.setPopup({popup: "popup.html"});
    chrome.storage.local.set({isSigned: false}, function() {
    });
    chrome.storage.local.set({isDark: false}, function() {
    });
    let p = document.getElementsByClassName('profile-picture')
    for(let i=0;i<p.length;i++){
      p[i].style.display = "none"
    }
    chrome.storage.local.set({profile_pic: ''}, function() {
    });
    setTimeout(function(){ 
      window.close('chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/settings.html') 
    }, 1000);
    
   
  }).catch(function(error) {
    console.log("An error happened."+error)
  });
 
})

/////SETTINGS MENU/////


function make_dark(){
 chrome.storage.local.set({isDark: true})
  let logo =  document.getElementById('Netsips-img')
  let body = document.getElementsByTagName('body')[0]
  let london = document.getElementById('London')
  let paris = document.getElementById('Paris')
  let rome = document.getElementById('Rome')
  let tabcontent = document.getElementsByClassName('tabcontent')[0]
  let tab_btns = document.getElementsByClassName('tab')[0]
  tab_btns.style.background = '#242424'
  body.style.background = '#303030'
  tabcontent.style.background = '#303030'
  // london.style.background = '#303030'
  // paris.style.background = '#303030'
  // rome.style.background = '#303030'
 london.style.color  = 'rgba(255, 255, 255, 0.7)'
 logo.src = 'images/yellow_netsips.svg'
 document.getElementById('sc').className ='darktablinks'
 document.getElementById('saved-btn').className = 'darktablinks'
 document.getElementById('archived').className = 'darktablinks'
 document.getElementById('SignOut').className = 'darktablinks'
 document.getElementById('howtouse').className = 'darktablinks'
 let tags = document.getElementsByClassName('filter_tags')
 for(let j=0;j<tags.length;j++){
   tags[j].style.background = '#4c4e4d'
   tags[j].style.color = 'white'
 }

}

function make_light(){
  chrome.storage.local.set({isDark: false})
  let logo =  document.getElementById('Netsips-img')
  let body = document.getElementsByTagName('body')[0]
  let london = document.getElementById('London')
  let paris = document.getElementById('Paris')
  let rome = document.getElementById('Rome')
  let tabcontent = document.getElementsByClassName('tabcontent')[0]
  body.style.background = '#fff'
  tabcontent.style.background = '#fff'
  let tab_btns = document.getElementsByClassName('tab')[0]
  tab_btns.style.background = '#f1f1f1'
  // london.style.background = '#fff'
  // paris.style.background = '#fff'
  // rome.style.background = '#fff'
  body.style.color  = 'black'
london.style.color  = 'black'
logo.src = 'images/grey_netsips.svg'
document.getElementById('sc').className ='tablinks'
document.getElementById('archived').className = 'tablinks'
document.getElementById('saved-btn').className = 'tablinks'
document.getElementById('SignOut').className = 'tablinks'
document.getElementById('howtouse').className = 'tablinks'
 let tags = document.getElementsByClassName('filter_tags')
 for(let j=0;j<tags.length;j++){
   tags[j].style.background = '#f1f1f1'
   tags[j].style.color = 'black'
 }

}



//SAVED SETTINGS//
 document.getElementById('dark_mode_checkbox').addEventListener('change', function(){
  if(this.checked== true){
    make_dark()
  }else{
    make_light()
  }
})


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
  let x = this  
  chrome.storage.local.get(['isDark'], function(result) {
    if(result.isDark){
      if(x.style.backgroundColor == "rgb(76, 78, 77)"){
        x.style.backgroundColor = "rgb(255, 255, 0)" 
        x.style.color = "rgb(0, 0, 0)" // the rgb value string is sensitive to spaces
        filter_tag_collector()
      }
      else{
        x.style.backgroundColor = "rgb(76, 78, 77)"
        x.style.color = "rgb(255,255,255)"
        filter_tag_collector()
      }
    }else{
      if(x.style.backgroundColor == "rgb(241, 241, 241)"){
        x.style.backgroundColor = "rgb(255, 255, 0)" // the rgb value string is sensitive to spaces
        filter_tag_collector()
      }
      else{
        x.style.backgroundColor = "rgb(241,241,241)"
        filter_tag_collector()
      }
    }
    
  });


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

window.addEventListener('load', function(){
  document.getElementById('searchBarDel').addEventListener('keyup',function(){
     var input = document.getElementById("searchBarDel");
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