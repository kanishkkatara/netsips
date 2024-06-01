/**
 * Netsips New Tab Page (Local-First Edition)
 */
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



document.getElementById('gsearch').addEventListener('click', function(){
  let search = document.getElementById('searchBar').value
  if(search){
    let url = `https://www.google.com/search?q=${search}`
    window.open(url,"_self");
  }
  
})

document.getElementById('searchBar').addEventListener("keyup", function(event) {

  if (event.keyCode === 13) { event.preventDefault();
    document.getElementById('gsearch').click();
  }
})