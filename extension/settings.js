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


function renderLocalBookmarks() {
  chrome.storage.local.get({ list: [] }, function(data) {
    var newsContent = document.getElementById('news-content');
    if (!newsContent) return;
    newsContent.innerHTML = '';
    var items = data.list || [];
    if (items.length === 0) {
      newsContent.innerHTML = '<center style="margin:40px;font-family:\'Manrove-tabs\';font-size:18px;color:#666;">No bookmarks saved yet. Click the Netsips icon on any page to save one!</center>';
      return;
    }
    let markers = [];
    items.forEach(function(item, idx) {
      let url = item.URL || '#';
      let title = title_trimmer(item.Title || url);
      let time = item.Date ? date_processing(new Date(item.Date)) : 'Recent';
      let icon = favicon + encodeURIComponent(url);
      let link_tag_name = item.Tags || '';
      let key = 'local_' + idx;
      let img = item.imageUrl || 'images/extension_images/placeholder.png';
      let main_site_name = item.mainSite || '';
      newsContent.innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner' title='Archive bookmark'><img src='images/extension_images/archive-grey.svg'></span> <a href="${url}" target="_blank"><img class='img-container-tag' src="${img}"></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src="${icon}"></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href="${url}" target="_blank">${title}</a></p> <div><span class='card_tags' style='overflow:hidden;text-overflow:ellipsis;margin-right:10px'>${link_tag_name}</span><span><img src='images/extension_images/edit.png' class='edit' title='Update tags'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`;
      if (link_tag_name) markers.push(link_tag_name);
    });

    for (var j = 0; j < document.getElementsByClassName('topcorner').length; j++) {
      let key = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText;
      document.getElementsByClassName('topcorner')[j].onclick = function() {
        hellocard1(key, 'local_user');
      };
    }

    for (var j = 0; j < document.getElementsByClassName('edit').length; j++) {
      let key = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText;
      let card_tags = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('card_tags')[0].innerText;
      let card_title = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('card_title')[0].innerText;
      document.getElementsByClassName('edit')[j].onclick = function() {
        tags1(key, 'local_user', card_tags, card_title);
      };
    }

    if (markers.length > 0) {
      tag_render(markers.filter(onlyUnique).map(s => s.split(',')).join().toLowerCase().split(',').map(tag_trimmer).filter(onlyUnique));
      var filter_tags = document.getElementsByClassName("filter_tags");
      for (var i = 0; i < filter_tags.length; i++) {
        filter_tags[i].addEventListener('click', activeTag);
      }
    }
  });
}

//HANDLING THE SIGN UP MODAL AND INITIAL RENDERING OF THE CARDS
chrome.storage.local.get(['isSigned', 'key'], function(result){
  if(!result.isSigned){
    document.getElementsByClassName('signModal')[0].style.display = 'block'
    document.getElementById('news-content').innerHTML = ''
    let p = document.getElementsByClassName('profile-picture')
    for(let i=0;i<p.length;i++){
      p[i].style.display = "none"
    }
  }else{ //ONLY RENDER THE CARDS IF THE isSigned IS SET TO true
    let uid = result.key;
    if (!uid || uid === 'local_user') {
      renderLocalBookmarks();
      return;
    }
    let db_store = firebase.firestore();
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
         let main_site_name = doc.data().mainSite
         if(main_site_name == undefined){
           main_site_name = ''
         }
          document.getElementById('news-content').innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner' title='Archive bookmark'><img src='images/extension_images/archive-grey.svg'></span> <a href=${url} target='blank_'><img  class='img-container-tag' src=${img}></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src=${icon}></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href=${url} target='blank_'>${title}</a></p> <div><span class='card_tags' style='overflow:hidden;text-overflow:ellipsis;margin-right:10px'>${link_tag_name}</span><span><img src='images/extension_images/edit.png' class='edit' title='Update tags'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`
          markers.push(link_tag_name)
          sources.push(main_site_name)
        }
     for(var j=0;j<document.getElementsByClassName('topcorner').length;j++){ //topcorner is the archive button
       let key
      key  = document.getElementsByClassName('topcorner')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText
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

   });
    //tags rendering on the span container

    //NEVER CHANGE WHAT'S INSIDE THE TAG RENDERING METHOD
    tag_render(markers.filter(onlyUnique).map(s=>s.split(',')).join().toLowerCase().split(',').map(tag_trimmer).filter(onlyUnique))

    var filter_tags = document.getElementsByClassName("filter_tags");
    for(var i=0;i<filter_tags.length;i++){
      filter_tags[i].addEventListener('click', activeTag);
    }
      });
    });
  }
});

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
    var actionApi = chrome.action || chrome.browserAction;
    if (actionApi && actionApi.setPopup) {
      actionApi.setPopup({popup: "popup_main.html"});
    }

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
            document.getElementById('news-content').innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner' title='Archive bookmark'><img src='images/extension_images/archive-grey.svg'></span> <a href=${url} target='blank_'><img  class='img-container-tag' src=${img}></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src=${icon}></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href=${url} target='blank_'>${title}</a></p> <div><span class='card_tags'>${link_tag_name}</span><span><img src='images/extension_images/edit.png' class='edit' title='Update tags'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`
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
        console.warn("Sign-in fallback to local mode:", error);
        chrome.storage.local.set({
          isSigned: true,
          key: 'local_user',
          username: 'Guest'
        }, function() {
          var modal = document.getElementsByClassName("signModal")[0];
          if (modal) modal.style.display = "none";
          var actionApi = chrome.action || chrome.browserAction;
          if (actionApi && actionApi.setPopup) {
            actionApi.setPopup({popup: "popup_main.html"});
          }
          var userNameEl = document.getElementById('user-name');
          if (userNameEl) userNameEl.innerHTML = "hello, guest";
          renderLocalBookmarks();
        });
      });



})
//SIGNUP PROCESS ENDS//




//THIS IS FOR RENDERING THE ARCHIVED BOOKMARKS ON ARCHIVED PAGE
var db = firebase.firestore();

//EVERY '1' METHOD IS THE ARCHIVED COUNTERPART OF THE SAVED METHOD
const hellocard1=(key, uid)=>{
  if (!uid || uid === 'local_user') {
    chrome.storage.local.get({ list: [] }, function(data) {
      var items = data.list || [];
      var idx = parseInt(String(key).replace('local_', ''), 10);
      if (!isNaN(idx) && items[idx]) {
        items.splice(idx, 1);
        chrome.storage.local.set({ list: items }, function() {
          renderLocalBookmarks();
        });
      }
    });
    return;
  }
  db.collection(uid).doc(key).update({
    status: 102
  }).then(function() {
  }).catch(function(error){
    console.error("Error updating document: ", error);
  });
 }

const tags1 = (key, uid,card_tags, card_title)=>{
 let modal = document.getElementsByClassName("myModal")[0];
 if (!modal) return;
 if(card_title.length<42){
  modal.childNodes[3].childNodes[8].innerText = card_title
 }else{
  modal.childNodes[3].childNodes[8].innerText = card_title
 }

 modal.childNodes[3].childNodes[6].value = key
 modal.childNodes[3].childNodes[11].value = card_tags || ''
 modal.style.display = "block";
 var closeBtn = document.getElementById('close_modal');
 if (closeBtn) closeBtn.onclick = removeModal1;
 document.getElementById("make_changes_input").onclick = function(){addTags1(uid, key)}
}

function removeModal1(){
  var modal = document.getElementsByClassName("myModal")[0];
  if (modal) modal.style.display = "none";
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
  var submit_btn = document.getElementById("make_changes_input");
  if (submit_btn) submit_btn.value = "Saving...";
  var modal = document.getElementsByClassName("myModal")[0];
  var new_tags = document.getElementById('tag_input').value;
  if (!uid || uid === 'local_user') {
    chrome.storage.local.get({ list: [] }, function(data) {
      var items = data.list || [];
      var idx = parseInt(String(key).replace('local_', ''), 10);
      if (!isNaN(idx) && items[idx]) {
        items[idx].Tags = new_tags;
        chrome.storage.local.set({ list: items }, function() {
          if (modal) modal.style.display = "none";
          if (submit_btn) submit_btn.value = 'Update tags';
          renderLocalBookmarks();
        });
      }
    });
    return;
  }
  db.collection(uid).doc(key).update({
    tags: new_tags
   })
   .then(function() {
    if (modal) modal.style.display = "none";
    if (submit_btn) submit_btn.value = 'Update tags';
   })
   .catch(function(error){
     console.error("Error updating document: ", error);
     if (submit_btn) submit_btn.value = 'Update tags';
   });
}

//MAIN RENDER METHOD FOR ARCHIVED TAGS
const render_deleted = ()=>{
  chrome.storage.local.get(['key'], function(result){
    let uid = result.key;
    var delContent = document.getElementById('deleted-content');
    if (!delContent) return;
    if (!uid || uid === 'local_user') {
      delContent.innerHTML = '<center style="margin:40px;font-family:\'Manrove-tabs\';font-size:18px;color:#666;">No archived bookmarks.</center>';
      return;
    }
    let db = firebase.firestore();
    db.collection(uid).orderBy('dateAdded',"desc").get().then(docs=>{
      delContent.innerHTML = '';
      docs.forEach(doc=> {
        if(doc.data().status==102){
          let url = doc.data().articleURL;
          let title = title_trimmer(title_trimmer(doc.data().title));
          let time = date_processing(doc.data().dateAdded.toDate());
          let icon = favicon+url;
          let link_tag_name = doc.data().tags;
          let key = doc.id;
          let img = doc.data().imageUrl;
          let main_site_name = doc.data().mainSite || '';
          delContent.innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner1' title='Permanently delete bookmark'><img src='images/extension_images/delete.svg'></span> <a href="${url}" target='_blank'><img class='img-container-tag' src="${img}"></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src="${icon}"></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href="${url}" target='_blank">${title}</a></p> <div><span class='card_tags' style='display:none'>${link_tag_name}</span><span><img src='images/extension_images/restore.svg' class='edit1' title='Restore bookmark'></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`;
        }
      });

      for(var j=0; j<document.getElementsByClassName('topcorner1').length; j++){
        let key = document.getElementsByClassName('topcorner1')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText;
        document.getElementsByClassName('topcorner1')[j].onclick = function(){
          this.parentElement.parentElement.style.display = 'none';
          permanent_delete(key, uid);
        };
      }

      for(var j=0; j<document.getElementsByClassName('edit1').length; j++){
        let key = document.getElementsByClassName('topcorner1')[j].parentElement.parentElement.getElementsByClassName('key')[0].innerText;
        document.getElementsByClassName('edit1')[j].onclick = function(){
          this.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
          restore_card(key, uid);
        };
      }
    }).catch(function(err) {
      console.warn("Deleted fetch error:", err);
      delContent.innerHTML = '<center style="margin:40px;font-family:\'Manrove-tabs\';font-size:18px;color:#666;">No archived bookmarks.</center>';
    });
  });
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

function showSaved() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "none";
  if (rome) rome.style.display = "none";
  if (paris) paris.style.display = "block";
  var drop = document.getElementById("dropdown-menu");
  if (drop) drop.style.display = "none";
}

function showSettings() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "block";
  if (rome) rome.style.display = "none";
  if (paris) paris.style.display = "none";
  var drop = document.getElementById("dropdown-menu");
  if (drop) drop.style.display = "none";
}

function showArchived() {
  var london = document.getElementById("London");
  var rome = document.getElementById("Rome");
  var paris = document.getElementById("Paris");
  if (london) london.style.display = "none";
  if (rome) rome.style.display = "block";
  if (paris) paris.style.display = "none";
  var clearBtn = document.getElementById("Tag_search_button_del");
  if (clearBtn) {
    clearBtn.onclick = function() {
      clearArchive();
    };
  }
  render_deleted();
  var drop = document.getElementById("dropdown-menu");
  if (drop) drop.style.display = "none";
}

function handleSignOut() {
  function doSignOut() {
    var paris = document.getElementById("Paris");
    if (paris) paris.innerHTML = "";
    document.title = "Signing out...";
    var actionApi = chrome.action || chrome.browserAction;
    if (actionApi && actionApi.setPopup) {
      actionApi.setPopup({popup: "popup.html"});
    }
    chrome.storage.local.set({
      isSigned: false,
      key: "",
      username: "",
      profile_pic: "",
      isDark: false
    }, function() {
      var modal = document.getElementsByClassName("signModal")[0];
      if (modal) modal.style.display = "block";
      var userNameEl = document.getElementById("user-name");
      if (userNameEl) userNameEl.innerText = "";
      var profPics = document.getElementsByClassName("profile-picture");
      for (var i = 0; i < profPics.length; i++) {
        profPics[i].style.display = "none";
      }
      setTimeout(function() { 
        window.close(); 
      }, 500);
    });
  }

  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().signOut().then(doSignOut).catch(function(error) {
      console.warn("SignOut catch:", error);
      doSignOut();
    });
  } else {
    doSignOut();
  }
}

["saved-btn", "dropdown-saved-btn"].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener("click", showSaved);
});

["sc", "dropdown-sc"].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener("click", showSettings);
});

["archived", "dropdown-archived"].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener("click", showArchived);
});

["SignOut", "dropdown-SignOut"].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener("click", handleSignOut);
});

// GUEST / OFFLINE MODE BUTTON
var guestBtn = document.getElementById('guestbtn');
if (guestBtn) {
  guestBtn.addEventListener('click', function() {
    chrome.storage.local.set({
      isSigned: true,
      key: 'local_user',
      username: 'Guest'
    }, function() {
      var modal = document.getElementsByClassName("signModal")[0];
      if (modal) modal.style.display = "none";
      var actionApi = chrome.action || chrome.browserAction;
      if (actionApi && actionApi.setPopup) {
        actionApi.setPopup({popup: "popup_main.html"});
      }
      var userNameEl = document.getElementById('user-name');
      if (userNameEl) userNameEl.innerHTML = "hello, guest";
      renderLocalBookmarks();
    });
  });
}

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
  tabcontent.style.background = '#f2f2f2'
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
document.getElementById("submit-settings").addEventListener("submit", function(e) {
  if (e && e.preventDefault) e.preventDefault();

  var inputs = document.getElementsByTagName("input");
  var radios = [];
  var checkboxes = [];
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].type == "radio") {
      radios.push(inputs[i]);
    }
    if (inputs[i].type == "checkbox") {
      checkboxes.push(inputs[i]);
    }
  }
  var options = "";
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked == true && radios[i].id != "custom") {
      options = radios[i].value;
    } else if (radios[i].checked == true && radios[i].id == "custom") {
      for (var j = 0; j < checkboxes.length; j++) {
        if (checkboxes[j].checked == true) {
          options = options + String(checkboxes[j].value) + " ";
        }
      }
    }
  }

  chrome.storage.local.get(["key"], function(result) {
    if (result && result.key && result.key !== "local_user" && typeof firebase !== "undefined" && firebase.database) {
      try {
        var db_rtd = firebase.database();
        var rtd = db_rtd.ref();
        rtd.child(result.key).update({ "days": options });
      } catch (err) {
        console.warn("RTD update:", err);
      }
    }
    chrome.storage.local.set({ days: options });
  });

  alert("Your settings have been saved!");
})



// THE METHOD WHICH MAKES RENDERED TAGS YELLOW ON CLICK
function activeTag(){
  let x = this
  chrome.storage.local.get(['isDark'], function(result) {
    if(result.isDark){
      if(x.style.backgroundColor == "rgb(76, 78, 77)"){
        x.style.backgroundColor = "rgb(101, 52, 172)"
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
        x.style.backgroundColor = "rgb(101, 52, 172)" // the rgb value string is sensitive to spaces
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
   if(tag_spans[i].style.backgroundColor=="rgb(101, 52, 172)"){
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
var profPic = document.getElementsByClassName("profile-picture")[0];
if (profPic) {
  profPic.addEventListener("click", function(e) {
    e.stopPropagation();
    var drop = document.getElementById("dropdown-menu");
    if (drop) {
      drop.style.display = (drop.style.display === "block") ? "none" : "block";
    }
  });
}

document.addEventListener("click", function(e) {
  var drop = document.getElementById("dropdown-menu");
  if (drop && drop.style.display === "block") {
    if (!e.target.closest("#dropdown-menu") && !e.target.closest(".profile-picture")) {
      drop.style.display = "none";
    }
  }
});

//See you later...//
