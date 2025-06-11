// This file contains the background script for the extension, which runs in the background and handles events such as browser actions and messages from other parts of the extension.

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "doSomething") {
        // Handle the action
        sendResponse({status: "success"});
    }
});