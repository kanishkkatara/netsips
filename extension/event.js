// This function is called onload in the popup code
function getPageDetails(callback) {
    // Inject the content script into the current page
    chrome.tabs.executeScript(null, { file: 'content.js' });
    // When a message is received from the content script
    chrome.runtime.onMessage.addListener(function(message) {
        // Call the callback function
        callback(message);
    });
};

// var firebaseConfig = {
//   apiKey: "AIzaSyBDaQL21llq2-5ftbSh0WvC243M6p_ZsgY",
//   authDomain: "netsips-1586535958950.firebaseapp.com",
//   databaseURL: "https://netsips-1586535958950.firebaseio.com",
//   projectId: "netsips-1586535958950",
//   storageBucket: "netsips-1586535958950.appspot.com",
//   messagingSenderId: "617103322863",
//   appId: "1:617103322863:web:4fbe39c3ad6acf34f3f51a",
//   measurementId: "G-E4SH3K42ZY"
// };

  chrome.storage.local.get(['isSigned'], function(result) {

      if (result.isSigned) {
        chrome.browserAction.setPopup({popup: "popup_main.html"});
      } else {
          chrome.browserAction.setPopup({popup: "popup.html"});
      }


    });

//     firebase.initializeApp(firebaseConfig);

//     var db_store = firebase.firestore()


//     function title_trimmer(website_title){
//       if(website_title.length>=60){
//       website_title = website_title.substring(0, 60) + '...'
//       }else{
//       website_title = website_title
//       }
//       return website_title
//   }
  
//   function date_processing(){
//           var d = new Date(); 
//           var dateStr    
//       var date = d.getUTCDate();
//       var month = d.getUTCMonth() + 1; 
//       var year = d.getUTCFullYear();
//           if(date.length==1){
//                dateStr = "0" + date + "/" + month + "/" ; //
//           }else{
//                dateStr = date + "/" + month + "/" + year;
//           }
//        return dateStr   
//   }

//   var favicon = "https://s2.googleusercontent.com/s2/favicons?domain_url="
// var web_details  

// chrome.storage.local.get(['key'], function(result) {
//   var markers = [];
//   db_store.collection(result.key).get().then(querySnapshot => {
//     querySnapshot.docs.forEach(doc => {
//       if(doc.data().status!="Deleted"){
//         var url = doc.data().articleURL
//         var short_web_title = title_trimmer(doc.data().title)
//         var dateStr = date_processing()
//         var fav_icon = favicon+url 
//         var tags = doc.data().tags
//         var website_title = doc.data().title
//         var doc_id = doc.id
//         var img = doc.data().imageURL
//         web_details = {URL:url, Title:short_web_title, Date:dateStr,Icon:fav_icon, Tags:tags, Complete_Title:website_title, DocId: doc_id, BgImage:img };
//         markers.push(web_details);   
//     }     })})

//     if(markers.length!=0 && markers.length!=undefined)
//   {  
//       chrome.storage.local.set({ 
//                 list:markers              
//             }, function(items){
           
//             });
  
//   }else{
     
//       chrome.storage.local.set({ 
//           list:[]
//       });
//   }













// });