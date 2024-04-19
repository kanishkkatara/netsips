document.getElementById("ext_link").addEventListener('click', function() {
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
});

var guestBtn = document.getElementById("guest_btn");
if (guestBtn) {
  guestBtn.addEventListener('click', function() {
    chrome.storage.local.set({
      isSigned: true,
      key: 'local_user',
      username: 'Guest'
    }, function() {
      var actionApi = chrome.action || chrome.browserAction;
      if (actionApi && actionApi.setPopup) {
        actionApi.setPopup({ popup: "popup_main.html" });
      }
      window.location.href = "popup_main.html";
    });
  });
}