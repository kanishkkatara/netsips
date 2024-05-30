/*   "chrome_url_overrides" : {
        "newtab": "settings.html"
      }, */
      // const numItemsToGenerate = 1;
      // function renderItem(){
      //   fetch(`https://source.unsplash.com/1600x900/?wallpaper`).then((response) => {   
      //       document.body.style.backgroundImage = `url(${response.url})`
      //   }) 
      // }
      // renderItem()
document.getElementById('sc').addEventListener('click', function(){
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
});
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
      function real_date(ts){
          var d = new Date(ts);
          var date = d.getDate();
          var month = d.getMonth() + 1; 
          var year = d.getFullYear();
          var dayStr = (date < 10) ? ("0" + date) : ("" + date);
          var monthStr = (month < 10) ? ("0" + month) : ("" + month);
          return dayStr + "/" + monthStr + "/" + year;
      }
      
      function renderNewTabBookmarks() {
        var recentsEl = document.getElementById('recents');
        var newsContent = document.getElementById('news-content');
        if (!newsContent) return;

        if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
          LocalDB.bookmarks.getAll({ status: 100, limit: 4 }).then(function(items) {
            displayNewTabBookmarks(items);
          }).catch(function(err) {
            console.warn('LocalDB get error:', err);
            displayNewTabBookmarks([]);
          });
        } else {
          chrome.storage.local.get({ list: [] }, function(data) {
            displayNewTabBookmarks(data.list || []);
          });
        }
      }

      function displayNewTabBookmarks(items) {
        var recentsEl = document.getElementById('recents');
        var newsContent = document.getElementById('news-content');
        if (!newsContent) return;

        items = items || [];
        if (items.length === 0) {
          if (recentsEl) recentsEl.style.display = 'none';
          newsContent.innerHTML = '<div style="color:#f1f1f1;font-size:18px;margin-left:30px;">Your saved bookmarks will appear here</div>';
          return;
        }

        if (recentsEl) recentsEl.style.display = 'block';
        newsContent.innerHTML = '';
        for (let i = 0; i < items.length && i < 4; i++) {
          let item = items[i];
          let url = item.articleURL || item.URL || '#';
          let title = title_trimmer(item.title || item.Title || url);
          let time = item.dateAdded ? real_date(item.dateAdded) : (item.Date ? real_date(item.Date) : '');
          let icon = item.Icon || (favicon + encodeURIComponent(url));
          let link_tag_name = item.tags || item.Tags || '';
          let img = item.imageUrl || 'images/extension_images/placeholder.png';
          let main_site_name = item.mainSite || '';
          let key = item.id || item.Date || ('key_' + i);
          newsContent.innerHTML += `<div class='column'> <div class='card'> <div class='img-container' style='width:280px; height:200px; overflow:hidden; object-fit: cover;'> <span class='topcorner' title='Hide'><img src='images/extension_images/visibility_off-grey.svg'></span> <a href="${url}" target='_blank'><img class='img-container-tag' src="${img}"></a> </div> <div class='card-info-container'> <span class='card_favicon'><img src="${icon}"></span> <span class='card_site'>${main_site_name}</span> <span class='card_date'>${time}</span> <p class='card_title'><a href="${url}" target='_blank">${title}</a></p> <div><span class='card_tags' style='overflow:hidden;text-overflow:ellipsis;margin-right:10px'>${link_tag_name}</span><span></span></div> </div> <div class='key' style='display:none'>${key}</div> </div> </div>`;
        }

        var topCorners = document.getElementsByClassName('topcorner');
        for (let j = 0; j < topCorners.length; j++) {
          topCorners[j].addEventListener('click', hellocard);
        }
      }

      renderNewTabBookmarks();

      if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks && LocalDB.bookmarks.onSnapshot) {
        LocalDB.bookmarks.onSnapshot(function() {
          renderNewTabBookmarks();
        });
      }

      function hellocard() {
        let key = this.parentElement.parentElement.getElementsByClassName('key')[0].innerText;
        this.parentElement.parentElement.style.display = 'none';
        if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
          LocalDB.bookmarks.archive(key);
        } else {
          delete_this_card(key);
        }
      }

      function delete_this_card(x) {
        chrome.storage.local.get({list: []}, function(items) {
          items.list = items.list || [];
          for (let i = 0; i < items.list.length; i++) {
            if (x == items.list[i].Date || x == items.list[i].id) {
              items.list.splice(i, 1);
              break;
            }
          }
          chrome.storage.local.set(items);
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
      
      const addTags1 = (uid, key) => {
        var targetKey = key || uid;
        var submit_btn = document.getElementById("make_changes_input");
        if (submit_btn) submit_btn.value = "Saving...";
        var modal = document.getElementsByClassName("myModal")[0];
        var new_tags = document.getElementById('tag_input').value;

        if (typeof LocalDB !== 'undefined' && LocalDB.bookmarks) {
          LocalDB.bookmarks.update(targetKey, { tags: new_tags }).then(function() {
            if (modal) modal.style.display = "none";
            if (submit_btn) {
              submit_btn.value = "Saved!";
              setTimeout(function() { submit_btn.value = 'Update tags'; }, 1000);
            }
            renderNewTabBookmarks();
          }).catch(function(error) {
            console.error("Error updating tags: ", error);
            if (submit_btn) submit_btn.value = 'Update tags';
          });
        }
      }
      
      //MAIN RENDER METHOD FOR ARCHIVED TAGS

      
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
      
      
      
      //SIDEMENU//
      //PARIS - SAVED MENU
      //LONDON - SETTINGS MENU
      //ROME - ARCHIVED MENU
      

  
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
      
          
      // THE METHOD WHICH MAKES RENDERED TAGS YELLOW ON CLICK
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
      
      //COLLECTS THE TAGS THAT ARE CLICKED BY THE USERS
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
      
    //   window.addEventListener('load', function(){
    //     document.getElementById('searchBar').addEventListener('keyup',function(){
    //        var input = document.getElementById("searchBar");
    //        var filter = input.value.toUpperCase();
    //       var cards = document.getElementsByClassName('card')
    //       for(var j=0;j<cards.length;j++){
    //           txtValue = cards[j].getElementsByClassName('card_title')[0].innerText
    //           if (txtValue.toUpperCase().indexOf(filter) > -1) {
    //             cards[j].style.display = "";
    //         } else {
    //           cards[j].style.display = "none";
    //         }
    //       }
    //     })
      
      
    //   })
      


      
      
      
      
      
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



 ////////////////////////  
        
// function autocomplete(inp) {
//     /*the autocomplete function takes two arguments,
//     the text field element and an array of possible autocompleted values:*/
//     const api = '3867c44037ef84b2fd0874dadf938a2b'
//     var currentFocus;
//     var arr = []
//     /*execute a function when someone writes in the text field:*/
//     inp.addEventListener("input", async function(e) {
//         var a, b, i, val = this.value;
//         let search =  `http://api.serpstack.com/search?access_key=${api}&query=${val}`
//         arr = await fetch(search)
//         .then(response => response.json()).then(
//           function(data){
//              // var arr 
//              console.log(data.organic_results)
//               return(data.organic_results.map(x => x.title))
//           }
//         )
//         // .then(data => (arr = data.organic_results));
//     //   console.log(arr)
//         /*close any already open lists of autocompleted values*/
//         closeAllLists();
//         if (!val) { return false;}
//         currentFocus = -1;
//         /*create a DIV element that will contain the items (values):*/
//         a = document.createElement("DIV");
//         a.setAttribute("id", this.id + "autocomplete-list");
//         a.setAttribute("class", "autocomplete-items");
//         /*append the DIV element as a child of the autocomplete container:*/
//         this.parentNode.appendChild(a);
//         /*for each item in the array...*/
//         for (i = 0; i < arr.length; i++) {
//           /*check if the item starts with the same letters as the text field value:*/
//           if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
//             /*create a DIV element for each matching element:*/
//             b = document.createElement("DIV");
//             /*make the matching letters bold:*/
//             b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
//             b.innerHTML += arr[i].substr(val.length);
//             /*insert a input field that will hold the current array item's value:*/
//             b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
//             /*execute a function when someone clicks on the item value (DIV element):*/
//             b.addEventListener("click", function(e) {
//                 /*insert the value for the autocomplete text field:*/
//                 inp.value = this.getElementsByTagName("input")[0].value;
//                 /*close the list of autocompleted values,
//                 (or any other open lists of autocompleted values:*/
//                 closeAllLists();
//             });
//             a.appendChild(b);
//           }
//         }
//     });
//     /*execute a function presses a key on the keyboard:*/
//     inp.addEventListener("keydown", function(e) {
//         var x = document.getElementById(this.id + "autocomplete-list");
//         if (x) x = x.getElementsByTagName("div");
//         if (e.keyCode == 40) {
//           /*If the arrow DOWN key is pressed,
//           increase the currentFocus variable:*/
//           currentFocus++;
//           /*and and make the current item more visible:*/
//           addActive(x);
//         } else if (e.keyCode == 38) { //up
//           /*If the arrow UP key is pressed,
//           decrease the currentFocus variable:*/
//           currentFocus--;
//           /*and and make the current item more visible:*/
//           addActive(x);
//         } else if (e.keyCode == 13) {
//           /*If the ENTER key is pressed, prevent the form from being submitted,*/
//           e.preventDefault();
//           if (currentFocus > -1) {
//             /*and simulate a click on the "active" item:*/
//             if (x) x[currentFocus].click();
//           }
//         }
//     });
//     function addActive(x) {
//       /*a function to classify an item as "active":*/
//       if (!x) return false;
//       /*start by removing the "active" class on all items:*/
//       removeActive(x);
//       if (currentFocus >= x.length) currentFocus = 0;
//       if (currentFocus < 0) currentFocus = (x.length - 1);
//       /*add class "autocomplete-active":*/
//       x[currentFocus].classList.add("autocomplete-active");
//     }
//     function removeActive(x) {
//       /*a function to remove the "active" class from all autocomplete items:*/
//       for (var i = 0; i < x.length; i++) {
//         x[i].classList.remove("autocomplete-active");
//       }
//     }
//     function closeAllLists(elmnt) {
//       /*close all autocomplete lists in the document,
//       except the one passed as an argument:*/
//       var x = document.getElementsByClassName("autocomplete-items");
//       for (var i = 0; i < x.length; i++) {
//         if (elmnt != x[i] && elmnt != inp) {
//           x[i].parentNode.removeChild(x[i]);
//         }
//       }
//     }
//     /*execute a function when someone clicks in the document:*/
//     document.addEventListener("click", function (e) {
//         closeAllLists(e.target);
//     });
//   }
  
//   /*An array containing all the country names in the world:*/
//   //var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];
  
//   /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
//   autocomplete(document.getElementById("searchBar"));
document.getElementById('gsearch').addEventListener('click', function(){
  let search = document.getElementById('searchBar').value
  if(search){
    let url = `https://www.google.com/search?q=${search}`
    window.open(url,"_self");
  }
  
})

// document.getElementById('gsearch').onkeypress=function(e){
//   if(e.keyCode==13){
//     let search = document.getElementById('searchBar').value
//     let url = `https://www.google.com/search?q=${search}`
//     window.open(url);
//   }
// }

document.getElementById('searchBar').addEventListener("keyup", function(event) {

  if (event.keyCode === 13) { event.preventDefault();
    document.getElementById('gsearch').click();
  }
})