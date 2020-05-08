/////////////////////////////////
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

function date_processing(){
      var d = new Date(); 
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

/////
// chrome.storage.local.get(['key'], function(result){
// var markers = [];
// var uid= result.key
// // function cards_from_db2(uid){
//  //var uid = "rzWqqw3stQdrO84QGiJn5oEyeZ02" 
//   var markers = [];
//   var web_details_from_db
//     var db_store = firebase.firestore()
//     db_store.collection(uid).onSnapshot(function(snapshot) {snapshot.docChanges().forEach(function(change){
//       if ((change.type === "added" || change.type==="modified")) {
//          // console.log(change.doc.data().status)
//           var url = change.doc.data().articleURL
//           var short_web_title = title_trimmer(change.doc.data().title)
//           var dateStr = date_processing()
//           var fav_icon = favicon+url
//           var tags = change.doc.data().tags
//           var website_title = change.doc.data().title
//           var doc_id = change.doc.id
//           var img = change.doc.data().imageUrl
//           var status = change.doc.data().status
//         //  console.log(change.doc.data().status)//&& change.doc.data().status!=102
//           web_details_from_db = {URL:url, Title:short_web_title, Date:dateStr,Icon:fav_icon, Tags:tags, Complete_Title:website_title, DocId: doc_id, BgImage:img };
//           if(status!=102){
//             markers.push(web_details_from_db);
//           }
//           // markers.push(web_details_from_db);
//         }})
//       console.log(markers)
//       if(markers.length!=0 && markers.length!=undefined){  
//         chrome.storage.local.set({ 
//           list:markers              
//       }, function(){
//         chrome.storage.local.get({ 
//           list:[] 
//         }, function(data){
//           console.log(data.list)
//          card_rendering(data)
//         }); 
//       });
//       }
//       else{
//         document.getElementById('news-content').innerHTML = ''
//         console.log("f")
//       }
//       markers = []  
//     //  }})
//     })
   
//   })
 
/////OLD CODE/////////////

function cards_from_db(uid){
  
var markers = [];
var web_details_from_db
  var db_store = firebase.firestore()
  db_store.collection(uid).orderBy('dateAdded',"asc").get().then(querySnapshot => {
   // console.log("Ok")
    querySnapshot.docs.forEach(doc => {
     // console.log(doc.data())
      if(doc.data().status!=102){ //deleted
       //console.log(doc.data())
        var url = doc.data().articleURL
        var short_web_title = title_trimmer(doc.data().title)
        var dateStr = date_processing()
        var fav_icon = favicon+url 
        var tags = doc.data().tags
       var website_title = doc.data().title
       var doc_id = doc.id
        var img = doc.data().imageUrl
        web_details_from_db = {URL:url, Title:short_web_title, Date:dateStr,Icon:fav_icon, Tags:tags, Complete_Title:website_title, DocId: doc_id, BgImage:img };
      //  var card = `<div class='column'> <div></div><div class='card' style="background:linear-gradient(rgba(255,255,255,.82), rgba(255,255,255,.82)), url(${img});"><div class="topcorner"><img src="close.png" style="height:13px;width:13px;opacity:70%"/></div><img src="tag_icon.png" class="edit"><a href=${url} target="_blank" class='news-link'><div class="saved_article_titles">${title}</div></a><p class="card_logo"><img src=${icon} style="opacity:100%"/></p><p class="card_date">${time}</p><div style='display:none'class="card_tags">${link_tag_name}</div></div></div>`
 
       markers.push(web_details_from_db);
      
      
      }  
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
        


    }
   )
  }
  )

}


/////OLD CODE/////////////

  chrome.storage.local.get(['key'], function(result) {
    cards_from_db(result.key)
  });


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






/////SAVED MENU////


///////CARD RENDERING/////  


function card_rendering(data) {
 // document.getElementById('news-content').innerHTML = ''
 for(var i=data.list.length-1;i>=0;i--){    // for(var i=data.list.length-1;i>=0;i--){
   var title = data.list[i]["Title"]
   var link = data.list[i]["URL"]
   var time = data.list[i]["Date"]     //
   var icon = data.list[i]["Icon"]  
   var link_tag_name = data.list[i]["Tags"]
   var bgimg = data.list[i]["BgImage"]
   var key = data.list[i]["DocId"]
 var card = `<div class='column'> <div></div><div class='card' style="background:linear-gradient(rgba(241,241,241,0.89), rgba(241,241,241,0.85)), url(${bgimg});background-size: contain;"><div class="topcorner"><img src="close.png" style="height:13px;width:13px;opacity:70%"/></div><img src="tag_icon.png" class="edit"><a href=${link} target="_blank" class='news-link'><div class="saved_article_titles">${title}</div></a><p class="card_logo"><img src=${icon} style="opacity:100%"/></p><p class="card_date">${time}</p><div style='display:none'class="card_tags">${link_tag_name}</div><div class="key" style="display:none">${key}</div></div></div>`
 document.getElementById('news-content').innerHTML += card //<p style="margin-top:35px;margin-left:-115px">Tags: none</p> icon waale para ke just baad
 
   for(var j=0;j<document.getElementsByClassName('topcorner').length;j++){
     document.getElementsByClassName('topcorner')[j].addEventListener('click', hellocard)
   }
   
   for(var j=0;j<document.getElementsByClassName('edit').length;j++){
     document.getElementsByClassName('edit')[j].addEventListener('click', tags)
   }
   }    
   }

/////BROOOOOO?????
  chrome.storage.local.get({ 
    list:[] 
  }, function(data){
    card_rendering(data)
  });  


///////CARD TAGS/////  

function tags(){

 // console.log(this.parentElement.childNodes)
  var card_tags = this.parentElement.childNodes[5].innerText
 // var card_title = this.parentElement.childNodes[2].innerText //key
 var card_key = this.parentElement.childNodes[6].innerText
var modal = document.getElementsByClassName("myModal")[0];

modal.childNodes[3].childNodes[6].value = card_key //input title value //card_title
modal.childNodes[3].childNodes[12].value = card_tags //input tag value
modal.style.display = "block";
var cross = document.getElementsByClassName("myModal")[0].childNodes[3].childNodes[1]
cross.addEventListener("click",removeModal)

document.getElementById("make_changes_input").addEventListener('click', addTags)

}

const addTags =()=>{
  //console.log(document.getElementById('title_input').value)
  let req_title = document.getElementById('title_input').value //Title of card
 // console.log(document.getElementById('tag_input').value)
  let tag_value = document.getElementById('tag_input').value //Tag of card
 let cards = document.getElementsByClassName('card')
  for(let i=0;i<cards.length;i++){
    if(cards[i].childNodes[6].innerText == req_title ){ //cards[i].childNodes[2].innerText
 cards[i].childNodes[5].innerText = tag_value
    }
  }

 chrome.storage.local.get({list:[]},function(items){
   update_the_tags(items, req_title, tag_value)
 } )
// window.location.reload()
}

const update_the_tags = (items, req_title, tag_value)=>{ //req_title is actually req_id
    var n
    var submit_btn
    submit_btn = document.getElementById("make_changes_input")
    submit_btn.value = " Saving..." 
    var db = firebase.firestore();
    for(var i=0;i<items.list.length;i++){
      if(JSON.stringify(req_title) == JSON.stringify(items.list[i].DocId)){ //check title instead of entire object
        items.list[i].Tags = tag_value
        n = items.list[i].DocId
      }      
    }  
  //  console.log(n)  
    chrome.storage.local.get(['key'], function(result) {
      //console.log(tag_value)
      // var db = firebase.firestore();
      db.collection(result.key).doc(n).update({
        tags: tag_value
       })
       .then(function() {
        submit_btn.value = "Saved!"
        window.location.reload()
       })
       .catch(function(error){
         console.error("Error updating document: ", error);
       });

      });
    
    
    chrome.storage.local.set(items, function(){
     console.log()

    })
   //  window.location.reload()
}


function removeModal(){
  this.parentElement.parentElement.style.display = "none"
} 

////TAG Generator for filtering///


document.getElementById('Tag_search_button').addEventListener('click', renderTags)

function renderTags(){
var x =  document.getElementById("span_container")
if (x.style.display == "none") {
  x.style.display = "";
} else {
  x.style.display = "none";
}
 
}

   chrome.storage.local.get({list:[]},function(items){
    var container =  document.getElementById("span_container")
    var tag_array = []
   for(var i=0;i<items.list.length;i++){
     tag_array.push(items.list[i].Tags.toLowerCase())
   }
    var mainTagList_beta 
     mainTagList_beta = removeDuplicates(tag_array)
     var real_array = []

     for(var k=0; k<mainTagList_beta.length;k++){
       if(mainTagList_beta[k].indexOf(',')>-1){
         var temp = mainTagList_beta[k].split(',')
         for(var l=0;l<temp.length;l++){
           real_array.push(temp[l].trim())
         }
       }else{
        real_array.push(mainTagList_beta[k])
       }
     }
     var mainTagList = removeDuplicates(real_array)
    for(var i=0;i<mainTagList.length;i++){
          if(JSON.stringify(mainTagList[i])!=JSON.stringify("none") && JSON.stringify(mainTagList[i])!=JSON.stringify("")){
      
            var span = `<span class="filter_tags" style="background-color: #f1f1f1;">${mainTagList[i].toLowerCase()}</span>`
            container.innerHTML += span
          }  
}
var tags_2 = document.getElementsByClassName("filter_tags")
for(var i=0;i<tags_2.length;i++){
    tags_2[i].addEventListener('click', activeTag)
}

   
}   
  )


 function removeDuplicates(data){

   return data.filter((value, index)=> data.indexOf(value)===index)
   
 }

// ////////////////

// ////// TAG FILTER /////

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

//////////////////////

///////CARD CLOSING BUTTON/////  

function hellocard(){

//  var website_title= this.parentElement.childNodes[2].innerText //Title
var website_key= this.parentElement.childNodes[6].innerText
 delete_this_card(website_key)
  this.parentElement.parentElement.style.display = 'none'

}
  
function delete_this_card(x){
  var n
  chrome.storage.local.get({list: []}, function(items) {
 for(var i=0;i<items.list.length;i++){
  
  if(JSON.stringify(x) == JSON.stringify(items.list[i].DocId)){ //check title instead of entire object //[i].Title
    n = items.list[i].DocId
    items.list.splice(i, 1)
    
  }
}

chrome.storage.local.get(['key'], function(result) {
   var db = firebase.firestore();
  db.collection(result.key).doc(n).update({
    status: 102  //Deleted
   }).then(function() {
   }).catch(function(error){
     console.error("Error updating document: ", error);
   });
  });

      chrome.storage.local.set(items, function() {
        console.log()
      });
    });
    
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