function shufflePlaylist() {
  const shuffleButton = document.querySelector('button[aria-label="Shuffle"]');
  if (shuffleButton) {
    shuffleButton.click();
    console.log("Shuffle button clicked.");
  } else {
    console.log("Shuffle button not found.");
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "shuffle") {
    shufflePlaylist();
    sendResponse({ status: "success" });
  }
});