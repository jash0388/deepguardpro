chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "deepguard-check",
    title: "🛡️ Check with DeepGuard",
    contexts: ["image"]
  });
  console.log("DeepGuard Pro extension installed!");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "deepguard-check") {
    chrome.storage.local.set({
      imageUrl: info.srcUrl,
      status: "pending"
    }, () => {
      chrome.action.openPopup();
    });
  }
});
