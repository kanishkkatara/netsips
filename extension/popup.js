document.getElementById("ext_link").addEventListener('click', function(){
  window.open(chrome.runtime.getURL('settings.html'), '_blank');
});