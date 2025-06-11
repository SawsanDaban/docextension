// This file contains the JavaScript logic for the options page, managing user settings and saving them.

document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    const optionsForm = document.getElementById('options-form');

    // Load saved options
    chrome.storage.sync.get(['option1', 'option2'], function(data) {
        document.getElementById('option1').value = data.option1 || '';
        document.getElementById('option2').checked = data.option2 || false;
    });

    // Save options
    saveButton.addEventListener('click', function() {
        const option1 = document.getElementById('option1').value;
        const option2 = document.getElementById('option2').checked;

        chrome.storage.sync.set({
            option1: option1,
            option2: option2
        }, function() {
            console.log('Options saved');
        });
    });
});