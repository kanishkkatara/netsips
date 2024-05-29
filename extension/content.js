
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

var content = '';
for(var i=0;i<p.length;i++){
    content = content + " " + p[i].innerText
}



function getMeta(metaName) {
    const metas = document.getElementsByTagName('meta');
  
    for (let i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute('property') === metaName) {
        return metas[i].getAttribute('content');
      }
    }
    return '';
  }

  function getMetaSite(metaName) {
    const metas = document.getElementsByTagName('meta');
  
    for (let i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute('name') === metaName) {
        return metas[i].getAttribute('content');
      }
    }
    return '';
  }

  // var image_link
  // if(getMeta("og:image")!='' || undefined){
  //   image_link = getMeta("og:image")
  // }else{
  //   image_link = `https://ui-avatars.com/api/?background=ccc&color=202020&size=250&name=${document.title}`
  // }
  // console.log(image_link)
//https://ui-avatars.com/api/?background=ccc&color=202020&size=250
// Send a message containing the page details back to the event page
var metaImage = getMeta("og:image")
// if(metaImage == ''){
//   metaImage = `https://api.apiflash.com/v1/urltoimage?access_key=996f192584b4414bac444ad540480b3d&format=png&no_ads=true&url=${window.location.href}&height=800&width=1000`         
// }
// images/placeholder.png
if(metaImage == ''){
  metaImage = chrome.runtime.getURL('images/extension_images/placeholder.png');         
}
try {
  chrome.runtime.sendMessage({
    title: document.title,
    url: window.location.href,
    word_count: count,
    estimated_time: Math.ceil(time),
    content: content,
    img_url: metaImage,
    main_site: getMeta('og:site_name') || ''
  }, function() {
    // Suppress error if popup is not active
    if (chrome.runtime.lastError) {}
  });
} catch (e) {}
 
