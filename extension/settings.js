/*   "chrome_url_overrides" : {
        "newtab": "settings.html"
      }, */


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

//MINOR UTILITY FUNCTIONS
//This shortenes the title of the card 
function title_trimmer(website_title){
  if(website_title.length>=70){
 website_title = website_title.substring(0, 70) + '...'
// website_title = website_title  
}else{
  website_title = website_title
  }
  return website_title
}
//Convert timestamp to date string
function date_processing(d){  
let months = ['Jan', 'Feb','March','April','May', 'June','July','Aug','Sept','Oct','Nov','Dec'] 
var date = d.getDate();
var month = d.getMonth(); 
return date + ' '+months[parseInt(month)]  
}

//I have no clue what's this doing here. BUT DO NOT TOUCH IT
function update(array, webdata)
 {
  array.push(webdata);
  chrome.storage.local.set({ 
      list:array
  });
  }

//Favicon API  
var favicon = "https://s2.googleusercontent.com/s2/favicons?domain_url=" 

//ANOTHER IMPORTANT ONE RIGHT HERE
function tag_trimmer(a){return a.trim()}


//KICKS OUT REPEATING TAGS FROM RENDERING QUEUE
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}


//HANDLING THE SIGN UP MODAL AND INITIAL RENDERING OF THE CARDS
chrome.storage.local.get(['isSigned'], function(result){
  if(!result.isSigned){
    document.getElementsByClassName('signModal')[0].style.display = 'block'
    document.getElementById('news-content').innerHTML = '' 
    let p = document.getElementsByClassName('profile-picture')
    for(let i=0;i<p.length;i++){
      p[i].style.display = "none"
    }
  }else{ //ONLY RENDER THE CARDS IF THE isSigned IS SET TO true
    //THIS IS ALSO THE PRIMARY CARD RENDER METHOD OF THE SAVED MENU 
    //AKA THE MOST IMPORTANT FUNCTIONALITY OF THE ENTIRE PRODUCT
    chrome.storage.local.get(['key'], function(result){
      let uid= result.key 
let db_store = firebase.firestore()
      db_store.collection(uid).onSnapshot(function(snapshot) {
       document.getElementById('news-content').innerHTML = ''
           db_store.collection(uid).orderBy('dateAdded',"desc").get().then(querySnapshot => {
            let  markers =[]
            let sources = []
            querySnapshot.docs.forEach(doc => {            
            if(doc.data().status!=102){ 
          let url = doc.data().articleURL
          let title = title_trimmer(doc.data().title)  
          let time = date_processing(doc.data().dateAdded.toDate())
          let icon = favicon+url 
          let link_tag_name = doc.data().tags
          let key = doc.id
         let img = doc.data().imageUrl
        //  if(img=='' || undefined || null){
        //    img = `https://api.apiflash.com/v1/urltoimage?access_key=996f192584b4414bac444ad540480b3d&format=png&no_ads=true&url=${url}&height=800&width=1000`
        //  } 
         let main_site_name = doc.data().mainSite
         if(main_site_name == undefined){
           main_site_name = ''
         }
          document.getElementById('news-content').innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner'><img src='http://netsips.in/images/extension_images/archive-grey.svg'></span> <a href=${url} target='blank_'><img  class='img-container-tag' src=${img}></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src=${icon}></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href=${url} target='blank_'>${title}</a></p> <div><span class='card_tags' style='overflow:hidden;text-overflow:ellipsis;margin-right:10px'>${link_tag_name}</span><span><img src='http://netsips.in/images/extension_images/edit.png' class='edit'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`       
          markers.push(link_tag_name)
          sources.push(main_site_name)
        }
     for(var j=0;j<document.getElementsByClassName('topcorner').length;j++){ //topcorner is the archive button
       let key
      key  = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText
  //   console.log(key)
       document.getElementsByClassName('topcorner')[j].onclick = function(){
        hellocard1(key, uid)}
     }
     
     for(var j=0;j<document.getElementsByClassName('edit').length;j++){ //edit is the tag update button
      let key
      let card_tags
      let card_title
      key  = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText
      card_tags = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('card_tags')[0].innerText
      card_title = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('card_title')[0].innerText
      document.getElementsByClassName('edit')[j].onclick =  function(){tags1(key, uid, card_tags, card_title)}}
       
   }
   
   )
    //tags rendering on the span container

    //NEVER CHANGE WHAT'S INSIDE THE TAG RENDERING METHOD
    tag_render(markers.filter(onlyUnique).map(s=>s.split(',')).join().toLowerCase().split(',').map(tag_trimmer).filter(onlyUnique))
   
    // let tagdivs = document.getElementsByClassName('tags')
    //       for(let i=0; tagdivs.length;i++){
    //        tagdivs[i].onclick = function(){filter_using_tags(tagdivs[i].innerText)}
    //       }
    
    
    
    
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

//CHECK IF THE DOM SUPPOSED TO BE IN DARK MODE OR NAH
document.addEventListener('DOMContentLoaded',()=>{
  chrome.storage.local.get(['isDark','isHome'], function(result) {
    if(result.isDark){
      document.getElementById('dark_mode_checkbox').checked = true  
      make_dark()
    }else{
      document.getElementById('dark_mode_checkbox').checked = false
      make_light() //THAT'S A RACIST FUNCTION 
    }
    if(result.isHome){
      document.getElementById('home_mode_checkbox').checked = true  
    
    }else{
      document.getElementById('home_mode_checkbox').checked = false

    }
  });
  
})
let db_rtd = firebase.database();
let rtd  = db_rtd.ref();


document.addEventListener('DOMContentLoaded',()=>{
  chrome.storage.local.get(['isWhatsApp', 'key'], function(result) {

rtd.child(result.key).once('value').then(function(snapshot) {
  let phone = snapshot.val().phone;
  let isWhatsApp = snapshot.val().isWhatsApp;
  document.getElementById('number_holder').value = phone
  chrome.storage.local.set({isWhatsApp: isWhatsApp}) 
  if(isWhatsApp){
    document.getElementById('isWhatsApp').checked = true  
  }else{
    document.getElementById('isWhatsApp').checked = false  
  }
});

    
  });
  
})


//SIGNUP
document.getElementById('signinbtn').addEventListener('click', function(){
 
  var provider = new firebase.auth.GoogleAuthProvider();
 

  firebase.auth().signInWithPopup(provider).then(function(result) {
    document.getElementsByClassName("signModal")[0].style.display = "none"   
    chrome.storage.local.set({isSigned: true}, function() {
    });
    chrome.browserAction.setPopup({popup: "popup_main.html"});
    
    document.getElementById('user-name').innerHTML = "hello, " + result.user.displayName.split(' ')[0].toLowerCase()
    var email =  result.user.email
    var value = result.user.uid
    var profile_picture = result.user.photoURL
    var username = "hello, " + result.user.displayName.split(' ')[0].toLowerCase()
    var new_user  = result.additionalUserInfo.isNewUser
    chrome.storage.local.set({username: username})
    chrome.storage.local.set({isNew: new_user}) 
    chrome.storage.local.set({isDark: false})
    chrome.storage.local.set({userEmail: email})
    chrome.storage.local.set({isHome: true})

// RTD Initialize for setting default settings preferences
var db = firebase.database();
var rtd  = db.ref();

rtd.once("value")
  .then(function(snapshot) {
    var hasName = snapshot.hasChild(value); 
    if(!hasName){
        rtd.child(value).set({'email': email, 'days':"6", 'isWhatsApp':false,'phone':'Your Number'}).then().catch(); //$$ isNew Added
    }
  });
  rtd.child(value).once('value').then(function(snapshot) {
    let phone = snapshot.val().phone;
    let isWhatsApp = snapshot.val().isWhatsApp;
    document.getElementById('number_holder').value = phone
    chrome.storage.local.set({isWhatsApp: isWhatsApp}) 
    if(isWhatsApp){
      document.getElementById('isWhatsApp').checked = true
    }else{
      document.getElementById('isWhatsApp').checked = false
    }
  });
  
//rtd.child(value).update({'isSigned': true})

 chrome.storage.local.set({profile_pic: profile_picture}, function() {
});
let p = document.getElementsByClassName('profile-picture')
    for(let i=0;i<p.length;i++){
      p[i].style.display = "block"
    }
let photo_link
 chrome.storage.local.get(['profile_pic'], function(result) {
   photo_link =  result.profile_pic
   for(let i=0;i<p.length;i++){
    p[i].src = photo_link 
  }
});
    //UID OF THE USER BEING SENT TO LOCAL STORAGE
    chrome.storage.local.set({key: value}, function() {
      });
  
  chrome.storage.local.get(['isNew'], function(result){
    if(result.isNew){
      document.getElementById('news-content').innerHTML = '<div style="font-size:30px">The bookmarks you save using Netsips will appear here<div>'
  
    }else{
  
      chrome.storage.local.get(['key'], function(result){
        let uid= result.key 
     let db_store = firebase.firestore()
        db_store.collection(uid).onSnapshot(function(snapshot) {
         document.getElementById('news-content').innerHTML = ''
             db_store.collection(uid).orderBy('dateAdded',"desc").get().then(querySnapshot => {
              let  markers =[]
              let sources = []
              querySnapshot.docs.forEach(doc => {            
              if(doc.data().status!=102){ 
            let url = doc.data().articleURL
            let title = title_trimmer(doc.data().title)  
            let time = date_processing(doc.data().dateAdded.toDate())
            let icon = favicon+url 
            let link_tag_name = doc.data().tags
            let key = doc.id
            let img = doc.data().imageUrl
            let main_site_name =  doc.data().mainSite
            if(main_site_name == undefined){
              main_site_name = ''
            }
            // if(img=='' || undefined || null){
            //   img = `https://api.apiflash.com/v1/urltoimage?access_key=996f192584b4414bac444ad540480b3d&format=png&no_ads=true&url=${url}&height=800&width=1000`
            // } 
            document.getElementById('news-content').innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner'><img src='http://netsips.in/images/extension_images/archive-grey.svg'></span> <a href=${url} target='blank_'><img  class='img-container-tag' src=${img}></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src=${icon}></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href=${url} target='blank_'>${title}</a></p> <div><span class='card_tags'>${link_tag_name}</span><span><img src='http://netsips.in/images/extension_images/edit.png' class='edit'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`       
            markers.push(link_tag_name)
            sources.push(main_site_name)
          }
       for(var j=0;j<document.getElementsByClassName('topcorner').length;j++){
        
         let key
         key  = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText
        //  card_tags = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('card_tags')[0].innerText
        //  card_title = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('card_title')[0].innerText
         document.getElementsByClassName('topcorner')[j].onclick = function(){
          hellocard1(key, uid)}
       }
       
       for(var j=0;j<document.getElementsByClassName('edit').length;j++){
        let key
        let card_tags
        let card_title
        key  = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText
         card_tags = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('card_tags')[0].innerText
         card_title = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('card_title')[0].innerText
        document.getElementsByClassName('edit')[j].onclick =  function(){tags1(key, uid, card_tags, card_title)}}
         
     }
     
     )
      //tags rendering 
      tag_render(markers.filter(onlyUnique).map(s=>s.split(',')).join().toLowerCase().split(',').map(tag_trimmer).filter(onlyUnique))
      
      // let tagdivs = document.getElementsByClassName('tags')
      //     for(let i=0; tagdivs.length;i++){
      //      tagdivs[i].onclick = function(){filter_using_tags(tagdivs[i].innerText)}
      //     }
     
     
     
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
//SIGNUP PROCESS ENDS//




//THIS IS FOR RENDERING THE ARCHIVED BOOKMARKS ON ARCHIVED PAGE
var db = firebase.firestore();  

//EVERY '1' METHOD IS THE ARCHIVED COUNTERPART OF THE SAVED METHOD
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

//WHY THE HELL IS THIS THING HERE??
//WELL,THIS IS THE METHOD THE RENDERS THE UNIQUE TAGS FOR FILTERATION

//TAG RENDER FOR LIST VIEW
// const tag_render = (tags)=>{
//    let dark = document.getElementById('dark_mode_checkbox')
//   document.getElementById("tagContainer").innerHTML = ''
//       tags.forEach(tag=>{
//         if(tag!=''){
//         if(dark.checked){
//           document.getElementById("tagContainer").innerHTML += `<div class="tags">${tag}</div>`        
//         }else{
//         document.getElementById("tagContainer").innerHTML += `<div class="tags">${tag}</div>`
//         }
//         }  
//       })
// }  

//TAG RENDER FOR BUBBLE VIEW
const tag_render = (tags)=>{
  let dark = document.getElementById('dark_mode_checkbox')
  document.getElementById("span_container").innerHTML = ''
      tags.forEach(tag=>{
        if(tag!=''){
        if(dark.checked){
          document.getElementById("span_container").innerHTML += `<span class="filter_tags" style="background-color: #4c4e4d; color:white">${tag}</span>&nbsp &nbsp &nbsp`        
        }else{
        document.getElementById("span_container").innerHTML += `<span class="filter_tags" style="background-color: #f1f1f1;">${tag}</span>&nbsp &nbsp &nbsp`
        }
        }  
      })
}


//TAG_RENDER ENDS

//SOURCE RENDER


const source_render = (tags)=>{
  let dark = document.getElementById('dark_mode_checkbox')
  document.getElementById("span_container").innerHTML = ''
      tags.forEach(tag=>{
        if(tag!=''){
        if(dark.checked){
          document.getElementById("span_container").innerHTML += `<span class="filter_tags" style="background-color: #4c4e4d; color:white">${tag}</span>&nbsp &nbsp &nbsp`        
        }else{
        document.getElementById("span_container").innerHTML += `<span class="filter_tags" style="background-color: #f1f1f1;">${tag}</span>&nbsp &nbsp &nbsp`
        }
        }  
      })
}






//SOURCE RENDER ENDS

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
    submit_btn.value = 'Update tags'
   })
   .catch(function(error){
     console.error("Error updating document: ", error);
   });  
}

//MAIN RENDER METHOD FOR ARCHIVED TAGS
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
        let title = title_trimmer(title_trimmer(doc.data().title)  )
        let time = date_processing(doc.data().dateAdded.toDate())
        let icon = favicon+url 
        let link_tag_name = doc.data().tags
        let key = doc.id
        let img = doc.data().imageUrl
        // if(img=='' || undefined || null){
        //   img = `https://api.apiflash.com/v1/urltoimage?access_key=996f192584b4414bac444ad540480b3d&format=png&no_ads=true&url=${url}&height=800&width=1000`
        // } 
        let main_site_name =  doc.data().mainSite
        if(main_site_name == undefined){
          main_site_name = ''
        }
        // if(img=='' || undefined){
        //   img = `https://ui-avatars.com/api/?background=ccc&color=202020&size=250&name=`+title 
        // }
        document.getElementById('deleted-content').innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner1'><img src='http://netsips.in/images/extension_images/delete.svg'></span> <a href=${url} target='blank_'><img  class='img-container-tag' src=${img}></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src=${icon}></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href=${url} target='blank_'>${title}</a></p> <div><span class='card_tags' style='display:none'>${link_tag_name}</span><span><img src='http://netsips.in/images/extension_images/restore.svg' class='edit1'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`
              }
            }
            
            )

   for(var j=0;j<document.getElementsByClassName('topcorner1').length;j++){
     let key
     key = document.getElementsByClassName('topcorner1')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText
     document.getElementsByClassName('topcorner1')[j].onclick = function(){     
     this.parentElement.parentElement.style.display = 'none'
    permanent_delete(key, uid)}
   }
   
   for(var j=0;j<document.getElementsByClassName('edit1').length;j++){
    let key
    key = document.getElementsByClassName('topcorner1')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText
    document.getElementsByClassName('edit1')[j].onclick = function(){     
    this.parentElement.parentElement.parentElement.parentElement.style.display = 'none'
 restore_card(key, uid)
}
  }


        })
  
  })
 
}

//THIS METHOD PERMANENTLY KICKS OUT BOOKMARKS FROM DATABASE
function permanent_delete(key, uid){
  db.collection(uid).doc(key).delete().then(function() {
}).catch(function(error) {
    console.error("Error removing document: ", error);
});
}

//THIS CHANGES THE STATUS FROM 102 TO 100. SENDS THE BOOKMARK FROM ARCHIVED TO SAVED. 
function restore_card(key, uid){
  db.collection(uid).doc(key).update({
    status: 100 
   }).then(function() {
   }).catch(function(error){
     console.error("Error updating document: ", error);
   });

}

// DELETE ALL THE ARCHIVED ARTICLES PERMANENTLY FROM DB
const clearArchive = ()=>{
  document.getElementById('deleted-content').innerHTML = ` `
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
      
  })

})
}

//THE METHOD WHICH HANDLES THE PROFILE PICTURE DISPLAY
var p = document.getElementsByClassName('profile-picture')
var photo_link
 chrome.storage.local.get(['profile_pic'], function(result) {
   photo_link =  result.profile_pic
   for(var i=0;i<p.length;i++){
  //  console.log(p[i])
    p[i].src = photo_link 
  }
});

var un = document.getElementById('user-name')
chrome.storage.local.get(['username'], function(result){
  un.innerHTML = result.username
})

//SIDEMENU//
//PARIS - SAVED MENU
//LONDON - SETTINGS MENU
//ROME - ARCHIVED MENU


document.getElementById('saved-btn').addEventListener('click', function(){
  document.getElementById("London").style.display = "none"
  document.getElementById("Rome").style.display = 'none'
  document.getElementById("Paris").style.display = "block"
//  document.getElementsByClassName('tab')[0].style.display = 'block'
 // document.getElementsByClassName('tabcontent')[0].style.width = '83%'
})

document.getElementById('sc').addEventListener('click', function(){
      document.getElementById("London").style.display = "block"
  document.getElementById("Paris").style.display = "none"
  document.getElementById("Rome").style.display = 'none'
 // document.getElementsByClassName('tab')[0].style.display = 'none'
//  document.getElementsByClassName('tabcontent')[0].style.width = '100%'
})


document.getElementById('archived').addEventListener('click', function(){
  document.getElementById("London").style.display = "none"
document.getElementById("Paris").style.display = "none"
document.getElementById("Rome").style.display = 'block'
//document.getElementsByClassName('tab')[0].style.display = 'none'
//document.getElementsByClassName('tabcontent')[0].style.width = '100%'
document.getElementById('Tag_search_button_del').onclick = function(){
   clearArchive()
  }
render_deleted()

})

//HANDLES THE SIGNOUT OPERATIONS
document.getElementById("SignOut").addEventListener('click', function(){
 // this.innerText = "Signing out..."
  firebase.auth().signOut().then(function() {
  //   let db_rtd = firebase.database();
  //   let rtd  = db_rtd.ref();
  // chrome.storage.local.get(['key'], function(result) {
  //     rtd.child(result.key).update({'isSigned': false })
  //   });
      //  {'uid':value,'email':  email, 'days':"6", 'isNew': new_user, 'isSigned':true}
    document.getElementById('Paris').innerHTML = ''
    document.title = 'Signing out...'
    chrome.browserAction.setPopup({popup: "popup.html"});
    chrome.storage.local.set({isSigned: false}, function() {
    });
    chrome.storage.local.set({isDark: false}, function() {
    });
   // document.getElementsByClassName("signModal")[0].style.display = "block" 
    // let p = document.getElementsByClassName('profile-picture')
    // for(let i=0;i<p.length;i++){
    //   p[i].style.display = "none"
    // }
    chrome.storage.local.set({profile_pic: ''})
    let p = document.getElementsByClassName('profile-picture')
    for(let i=0;i<p.length;i++){
      p[i].style.display = "none"
    }
     chrome.storage.local.set({username: ''})
     document.getElementById('user-name').innerHTML = ''
    setTimeout(function(){ 
    //  document.getElementsByClassName("signModal")[0].style.display = "block" 
      window.close('chrome-extension://gbahaeoliekjdeaklngijenopidoifhc/settings.html') 
    }, 1000);
   
   
  }).catch(function(error) {
    console.log("An error happened."+error)
  });
 
})

//HANDLES DARK MODE//

function make_dark(){
 chrome.storage.local.set({isDark: true})
  let body = document.getElementsByTagName('body')[0]
  let london = document.getElementById('London')
  let paris = document.getElementById('Paris')
  let rome = document.getElementById('Rome')
  let tabcontent = document.getElementsByClassName('tabcontent')[0]
  // let tab_btns = document.getElementsByClassName('tab')[0]
  // tab_btns.style.background = '#242424'
  // tab_btns.style.color = 'rgba(255, 255, 255, 0.7)'
  body.style.background = '#242424' 
  tabcontent.style.background = '#242424'
  // linear-gradient(90deg, rgba(36,36,36,1) 0%, rgba(87,87,87,1) 100%)
  //   body.style.background = 'linear-gradient(135deg, rgba(36,36,36,1) 0%, rgba(87,87,87,1) 100%)' 
  // tabcontent.style.background = 'linear-gradient(135deg, rgba(36,36,36,1) 0%, rgba(87,87,87,1) 100%)'
  paris.style.color = 'rgba(255, 255, 255, 0.7)'
 london.style.color  = 'rgba(255, 255, 255, 0.7)'
 rome.style.color  = 'rgba(255, 255, 255, 0.7)'

 //bubble tags
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
  // let tab_btns = document.getElementsByClassName('tab')[0]
  // tab_btns.style.background = '#f1f1f1'
  // tab_btns.style.color = 'black'
  paris.style.color = 'black'
  rome.style.color = 'black'
  body.style.color  = 'black'
london.style.color  = 'black'
//bubble tags
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



// THE METHOD WHICH MAKES RENDERED TAGS YELLOW ON CLICK
function activeTag(){
  let x = this  
  chrome.storage.local.get(['isDark'], function(result) {
    if(result.isDark){
      if(x.style.backgroundColor == "rgb(76, 78, 77)"){
        x.style.backgroundColor = "rgb(177, 156, 217)" 
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
        x.style.backgroundColor = "rgb(177, 156, 217)" // the rgb value string is sensitive to spaces
        x.style.color = "rgb(255, 255, 255)"
        filter_tag_collector()
      }
      else{
        x.style.backgroundColor = "rgb(241,241,241)"
        x.style.color = "rgb(0, 0, 0)"
        filter_tag_collector()
      }
    }
    
  });


}

//COLLECTS THE TAGS THAT ARE CLICKED BY THE USERS
function filter_tag_collector(){
  var tag_spans = document.getElementsByClassName("filter_tags")
  var filter_tags = []
  for(var i=0;i<tag_spans.length;i++){
   if(tag_spans[i].style.backgroundColor=="rgb(177, 156, 217)"){
        filter_tags.push(tag_spans[i].innerText)
   }
  }
  real_tag_filter(filter_tags)
}

//DO NOT REMOVE THIS
let checker = (arr, target) => target.every(v => arr.includes(v)); 




//FINAL FILTERING RESULT
function real_tag_filter(list){

   var cards = document.getElementsByClassName("card")
  for(var i=0;i<cards.length;i++){
    let tag = cards[i].getElementsByClassName('card_tags')[0].innerText.toLowerCase().split(',')
    //var tag = cards[i].childNodes[5].innerText.toLowerCase().split(",")
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


///////SEARCHBAR FOR SAVED/////

window.addEventListener('load', function(){
  document.getElementById('searchBar').addEventListener('keyup',function(){
     var input = document.getElementById("searchBar");
     var filter = input.value.toUpperCase();
    var cards = document.getElementsByClassName('card')
    for(var j=0;j<cards.length;j++){
        txtValue = cards[j].getElementsByClassName('card_title')[0].innerText
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          cards[j].style.display = "";
      } else {
        cards[j].style.display = "none";
      }
    }
  })


})

//SEARCHBAR FOR ARCHIVED
// window.addEventListener('load', function(){
//   document.getElementById('searchBarDel').addEventListener('keyup',function(){
//      var input = document.getElementById("searchBarDel");
//      var filter = input.value.toUpperCase();
//     var cards = document.getElementsByClassName('card')
//     for(var j=0;j<cards.length;j++){
//         txtValue = cards[j].getElementsByClassName('card_title')[0].innerText
//         if (txtValue.toUpperCase().indexOf(filter) > -1) {
//           cards[j].style.display = "";
//       } else {
//         cards[j].style.display = "none";
//       }
//     }
//   })


// })

//SEARCHBAR FOR TAGS
//LIST VIEW
// window.addEventListener('load', function(){
//   document.getElementById('tagSearch').addEventListener('keyup',function(){
//      var input = document.getElementById("tagSearch");
//      var filter = input.value.toUpperCase();
//     var cards = document.getElementsByClassName('card')
//    var tags =  document.getElementsByClassName('tags')
//     for(var j=0;j<tags.length;j++){
//       txtValue = tags[j].innerText
//       if (txtValue.toUpperCase().indexOf(filter) > -1) {
//         tags[j].style.display = "";
//     } else {
//       tags[j].style.display = "none";
//     }
//   }
//     for(var j=0;j<cards.length;j++){
//         txtValue = cards[j].getElementsByClassName('card_tags')[0].innerText
//         if (txtValue.toUpperCase().indexOf(filter) > -1) {
//           cards[j].style.display = "";
//       } else {
//         cards[j].style.display = "none";
//       }
//     }
//   })
// })


//SEARCHBAR FOR TAGS
//BUBBLE VIEW
window.addEventListener('load', function(){
  document.getElementById('tagSearch').addEventListener('keyup',function(){
   // console.log('Hi')
     var input = document.getElementById("tagSearch");
     var filter = input.value.toUpperCase();
    var cards = document.getElementsByClassName('card')
   var tags =  document.getElementsByClassName('filter_tags')
  // alert(tags)
    for(var j=0;j<tags.length;j++){
      txtValue = tags[j].innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tags[j].style.display = "";
    } else {
      tags[j].style.display = "none";
    }
  }
    for(var j=0;j<cards.length;j++){
        txtValue = cards[j].getElementsByClassName('card_tags')[0].innerText
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          cards[j].style.display = "";
      } else {
        cards[j].style.display = "none";
      }
    }
  })
})







const filter_using_tags=(tag)=>{
    let cards = document.getElementsByClassName('card')
    document.getElementById('tagSearch').value = tag
    for(var j=0;j<cards.length;j++){
      let txtValue = cards[j].getElementsByClassName('card_tags')[0].innerText.toUpperCase()
      let txtValueArr = txtValue.split(',')
      for(let k=0;k<txtValueArr.length;k++){
        txtValueArr[k] = txtValueArr[k].trim()
      }
      if(txtValueArr.includes(tag.toUpperCase())) {
        cards[j].style.display = "";
    } else {
      cards[j].style.display = "none";
    }
  }
}

// //WHATSAPP//
// // return rtd.equalTo(userUID).once('value').then(function(snapshot) {
// //   var username = snapshot.val().username;
// //   // ...
// // });
// let wa_checkbox = document.querySelector("input[name=whatsapp_popup]");
// // let db_rtd = firebase.database();
// // let rtd  = db_rtd.ref();
// let number = document.getElementById('number_holder').value
// wa_checkbox.addEventListener( 'change', function() {
//   if(this.checked && number ===JSON.stringify('Your number')) {
//     window.open("http://netsips.in/whatsapp.html?", "Netsips | WhatsApp", "width=500,height=550");
//      let win = window.open("http://netsips.in/whatsapp.html?", "Netsips | WhatsApp", "width=500,height=550");
   
//        let timer = setInterval(function() { 
//             if(win.closed ==true) {
  
//                 clearInterval(timer);
//               //  document.querySelector("input[name=whatsapp_popup]").checked = false
//            //  alert('if');
//             }else if(win.closed ==true && !document.querySelector("input[name=whatsapp_popup]").checked){
//                clearInterval(timer);
//                 // document.querySelector("input[name=whatsapp_popup]").checked = true
//           //      alert('else');
//               }
//         }
//         , 100);
      




//   }else if(this.checked && number!=JSON.stringify('Your number')){
//     document.querySelector("input[name=whatsapp_popup]").checked = true
//     chrome.storage.local.get(['key'], function(result) {
//       rtd.child(result.key).update({'isWhatsApp': true })
//     }); 
//     chrome.storage.local.set({isWhatsApp: true}) 
//   }   
//   else {
//    // alert('Unsubcribed from WhatsApp alerts')
//     document.querySelector("input[name=whatsapp_popup]").checked = false
//     chrome.storage.local.get(['key'], function(result) {
//       rtd.child(result.key).update({'isWhatsApp': false })
//     }); 
//     chrome.storage.local.set({isWhatsApp: false}) 
//   }
// });

// document.getElementById('change_number').addEventListener('click', function(){
//    window.open("http://netsips.in/whatsapp.html?", "Netsips | WhatsApp", "width=500,height=550");
//    let win = window.open("http://netsips.in/whatsapp.html?", "Netsips | WhatsApp", "width=500,height=550");
//    let timer = setInterval(function() { 
//     if(win.closed ==true) {
//         clearInterval(timer);
//         chrome.storage.local.get(['key'], function(result) {
//         rtd.child(result.key).once('value').then(function(snapshot) {
//         let phone = snapshot.val().phone;
//         document.getElementById('number_holder').value = phone
//       });
//         }); 
//     }
// }
// , 100);

// })

// // rtd.child(result.key).once('value').then(function(snapshot) {
// //   var phone = snapshot.val().phone;
// //   document.getElementById('number_holder').value = phone
// // });
 

//HOME PAGE//

document.getElementById('home_mode_checkbox').addEventListener('change', function(){
  if(this.checked){
    chrome.storage.local.set({isHome: true})
  }else{
    chrome.storage.local.set({isHome: false})
  }
})


//DROPDOWN
// profile-picture
document.getElementsByClassName('profile-picture')[0].addEventListener('click', function(){
  if(document.getElementById('dropdown-menu').style.display == 'block'){
    document.getElementById('dropdown-menu').style.display = 'none'
  }else{
    document.getElementById('dropdown-menu').style.display = 'block'
  }
  
})


//See you later...//
