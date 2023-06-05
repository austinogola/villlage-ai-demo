var currentUrl = new URL(window.location.href);

let profile_id=currentUrl.pathname.split('/')[2]

chrome.runtime.sendMessage({getProfile:true,profile_id})