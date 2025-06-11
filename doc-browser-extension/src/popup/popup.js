// For production
const API_BASE_URL = 'https://docextension.irissmile.studio/api/files';

// For local development, comment out the line above and uncomment below:
// const API_BASE_URL = 'http://localhost:8080/api/files';

let selectedFiles = [];
const MAX_FILES_LIMIT = 5;
let indexedFileCount = 0;
let userSessionId = null;

// IndexedDB setup for client-side file storage
let db;
const DB_NAME = 'DocumentIndexDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize IndexedDB and user session
    initializeStorage().then(() => {
        // Initialize UI components after storage is ready
        initializeUI();
    });
});

async function initializeStorage() {
    // Get or create user session ID
    const result = await chrome.storage.local.get(['userSessionId']);
    if (result.userSessionId) {
        userSessionId = result.userSessionId;
    } else {
        userSessionId = generateSessionId();
        await chrome.storage.local.set({ userSessionId });
    }
    
    console.log('User Session ID:', userSessionId);
    
    // Initialize IndexedDB
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('fileName', 'fileName', { unique: false });
                store.createIndex('uploadDate', 'uploadDate', { unique: false });
            }
        };
    });
}

function generateSessionId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function initializeUI() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const serverStatus = document.getElementById('serverStatus');
    const indexedFilesList = document.getElementById('indexedFilesList');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const downloadIndexBtn = document.getElementById('downloadIndexBtn');
    const donateBtn = document.getElementById('donateBtn');

    // Check server status
    checkServerStatus();
    
    // Load indexed files
    loadIndexedFiles();

    // File upload handling
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', uploadFiles);
    clearBtn.addEventListener('click', clearFiles);
    
    // Search handling
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    clearAllBtn.addEventListener('click', clearAllData);
    downloadIndexBtn.addEventListener('click', downloadIndex);
    donateBtn.addEventListener('click', handleDonation);

    // Helper function to get files from IndexedDB
    async function getFilesFromStorage() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const files = request.result.map(file => ({
                    fileName: file.fileName,
                    size: file.size,
                    filePath: `local://${file.fileName}`,
                    uploadDate: file.uploadDate,
                    fileType: file.fileType
                }));
                resolve(files);
            };
            request.onerror = () => reject(request.error);
        });
    }

    function updateUploadAreaState() {
        const uploadArea = document.getElementById('uploadArea');
        const uploadBtn = document.getElementById('uploadBtn');
        
        if (indexedFileCount >= MAX_FILES_LIMIT) {
            uploadArea.classList.add('disabled');
            uploadBtn.disabled = true;
            
            uploadArea.innerHTML = `
                <div class="limit-message">
                    <i class="upload-icon">📚</i>
                    <p><strong>Storage Full</strong></p>
                    <small>You have ${MAX_FILES_LIMIT} files indexed. Clear some files to upload more.</small>
                </div>
            `;
            
        } else {
            uploadArea.classList.remove('disabled');
            
            uploadArea.innerHTML = `
                <div class="upload-content">
                    <i class="upload-icon">📁</i>
                    <p>Drop files here or click to browse</p>
                    <small>Maximum ${MAX_FILES_LIMIT} files • PDF, DOC, DOCX, TXT • Max 10MB each</small>
                    <input type="file" id="fileInput" multiple accept=".pdf,.doc,.docx,.txt">
                </div>
            `;
            
            // Reattach event listeners
            setTimeout(() => {
                const refreshedUploadArea = document.getElementById('uploadArea');
                const refreshedFileInput = document.getElementById('fileInput');
                
                if (refreshedUploadArea && refreshedFileInput) {
                    const newUploadArea = refreshedUploadArea.cloneNode(true);
                    refreshedUploadArea.parentNode.replaceChild(newUploadArea, refreshedUploadArea);
                    
                    const newFileInput = newUploadArea.querySelector('#fileInput');
                    
                    newUploadArea.addEventListener('click', function(e) {
                        if (newFileInput && !newUploadArea.classList.contains('disabled')) {
                            newFileInput.click();
                        }
                    });
                    
                    newUploadArea.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        if (!newUploadArea.classList.contains('disabled')) {
                            newUploadArea.classList.add('dragover');
                        }
                    });
                    
                    newUploadArea.addEventListener('drop', function(e) {
                        e.preventDefault();
                        newUploadArea.classList.remove('dragover');
                        if (!newUploadArea.classList.contains('disabled')) {
                            const files = Array.from(e.dataTransfer.files);
                            addFiles(files);
                        }
                    });
                    
                    if (newFileInput) {
                        newFileInput.addEventListener('change', function(e) {
                            const files = Array.from(e.target.files);
                            addFiles(files);
                        });
                    }
                }
            }, 100);
            
            uploadBtn.disabled = selectedFiles.length === 0;
        }
    }

    function checkServerStatus() {
        fetch(`${API_BASE_URL}/status`)
            .then(response => response.json())
            .then(data => {
                serverStatus.textContent = '🟢 Server Connected';
                serverStatus.className = 'status connected';
            })
            .catch(error => {
                serverStatus.textContent = '🔴 Server Disconnected';
                serverStatus.className = 'status error';
            });
    }

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        addFiles(files);
    }

    // Helper function that mimics the backend TextFileFilter logic
    function getFileType(filename) {
        const name = filename.toLowerCase();
        
        if (name.endsWith('.pdf')) {
            return 'PDF';
        } else if (name.endsWith('.txt')) {
            return 'TXT';
        } else if (name.endsWith('.doc')) {
            return 'DOC';
        } else if (name.endsWith('.docx')) {
            return 'DOCX';
        } else {
            return 'UNSUPPORTED';
        }
    }

    function isValidFileType(filename) {
        return getFileType(filename) !== 'UNSUPPORTED';
    }

    function addFiles(files) {
        // Check if upload is disabled due to indexed file limit
        if (indexedFileCount >= MAX_FILES_LIMIT) {
            alert(`You have reached the maximum limit of ${MAX_FILES_LIMIT} indexed files. Please clear your indexed files to upload more.`);
            return;
        }
        
        // Validate file types using the same logic as TextFileFilter
        const invalidFiles = files.filter(file => !isValidFileType(file.name));

        if (invalidFiles.length > 0) {
            alert(`Some files have unsupported types: ${invalidFiles.map(f => f.name).join(', ')}\n\nSupported types: PDF, DOC, DOCX, TXT`);
            return;
        }
        
        // Check if adding these files would exceed the selection limit
        const totalFiles = selectedFiles.length + files.length;
        if (totalFiles > MAX_FILES_LIMIT) {
            alert(`You can only upload a maximum of ${MAX_FILES_LIMIT} files at once. Please select fewer files.`);
            return;
        }

        files.forEach(file => {
            if (!selectedFiles.find(f => f.name === file.name)) {
                selectedFiles.push(file);
            }
        });
        updateFileList();
        uploadBtn.disabled = selectedFiles.length === 0;
    }

    function updateFileList() {
        fileList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileSpan = document.createElement('span');
            fileSpan.textContent = `${file.name} (${formatFileSize(file.size)})`;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', () => removeFile(index));
            
            fileItem.appendChild(fileSpan);
            fileItem.appendChild(removeBtn);
            fileList.appendChild(fileItem);
        });

        // Show file count with limit
        if (selectedFiles.length > 0) {
            const countInfo = document.createElement('div');
            countInfo.className = 'file-count-info';
            countInfo.textContent = `${selectedFiles.length}/${MAX_FILES_LIMIT} files selected`;
            if (selectedFiles.length >= MAX_FILES_LIMIT) {
                countInfo.classList.add('at-limit');
            }
            fileList.appendChild(countInfo);
        }
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        updateFileList();
        uploadBtn.disabled = selectedFiles.length === 0;
    }

    function clearFiles() {
        selectedFiles = [];
        fileInput.value = '';
        updateFileList();
        uploadBtn.disabled = true;
    }

    async function uploadFiles() {
        if (selectedFiles.length === 0) return;

        // Validate file types using TextFileFilter logic
        const invalidFiles = selectedFiles.filter(file => !isValidFileType(file.name));

        if (invalidFiles.length > 0) {
            alert(`Unsupported file types detected: ${invalidFiles.map(f => f.name).join(', ')}\n\nSupported types: PDF, DOC, DOCX, TXT`);
            return;
        }

        // Check file sizes
        const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024); // 10MB
        if (oversizedFiles.length > 0) {
            alert(`Files too large (max 10MB each): ${oversizedFiles.map(f => f.name).join(', ')}`);
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Processing...';

        try {
            // Store files in IndexedDB first
            const storedFiles = [];
            for (const file of selectedFiles) {
                const fileData = await storeFileLocally(file);
                storedFiles.push(fileData);
            }

            // Send files to backend for indexing with user session
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('userSessionId', userSessionId);

            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message || `Successfully uploaded ${data.indexedFiles.length} files!`);
                clearFiles();
                loadIndexedFiles();
            } else {
                // Remove files from IndexedDB if backend indexing failed
                for (const fileData of storedFiles) {
                    await removeFileFromStorage(fileData.id);
                }
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please check your internet connection and try again.');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload & Index Files';
        }
    }

    async function storeFileLocally(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const fileData = {
                    id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    fileName: file.name,
                    fileType: getFileType(file.name),
                    size: file.size,
                    content: reader.result,
                    uploadDate: new Date(),
                    userSessionId: userSessionId
                };

                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.add(fileData);

                request.onsuccess = () => resolve(fileData);
                request.onerror = () => reject(request.error);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    async function removeFileFromStorage(fileId) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(fileId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async function performSearch() {
        const keywords = searchInput.value.trim();
        if (!keywords) return;

        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
        searchResults.innerHTML = '<div class="loading">Searching files...</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/search?keywords=${encodeURIComponent(keywords)}&userSessionId=${userSessionId}`);
            const data = await response.json();
            displaySearchResults(data);
        } catch (error) {
            searchResults.innerHTML = `<div class="error">Search failed: ${error.message}</div>`;
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Search';
        }
    }

    function displaySearchResults(data) {
        searchResults.innerHTML = '';
        
        if (!data.success) {
            searchResults.innerHTML = `<div class="error">${data.error}</div>`;
            return;
        }
        
        if (data.results && data.results.length > 0) {
            const header = document.createElement('div');
            header.className = 'results-header';
            header.textContent = data.message || `Found ${data.totalResults} results`;
            searchResults.appendChild(header);

            data.results.forEach(result => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'search-result';
                resultDiv.innerHTML = `
                    <div class="result-title">${escapeHtml(result.fileName)}</div>
                    <div class="result-snippet">${escapeHtml(result.snippet)}</div>
                    <div class="result-relevance">Relevance: ${result.relevance}</div>
                `;
                searchResults.appendChild(resultDiv);
            });
        } else {
            searchResults.innerHTML = '<div class="no-results">No results found. Try different keywords.</div>';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async function loadIndexedFiles() {
        try {
            // Load files from IndexedDB (local storage)
            const files = await getFilesFromStorage();
            displayIndexedFiles({ success: true, files: files });
        } catch (error) {
            console.error('Failed to load indexed files:', error);
            if (indexedFilesList) {
                indexedFilesList.innerHTML = '<div class="error">Failed to load indexed files</div>';
            }
        }
    }

    function displayIndexedFiles(data) {
        if (!indexedFilesList) return;
        
        indexedFilesList.innerHTML = '';
        
        if (data.success && data.files && data.files.length > 0) {
            indexedFileCount = data.files.length;
            
            const header = document.createElement('div');
            header.className = 'indexed-files-header';
            header.textContent = `Indexed Files (${data.files.length})`;
            indexedFilesList.appendChild(header);

            data.files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'indexed-file-item';
                fileItem.innerHTML = `
                    <div class="indexed-file-name">${file.fileName || file.name}</div>
                    <div class="indexed-file-path">${file.filePath || file.path}</div>
                    <div class="indexed-file-size">${file.size ? formatFileSize(file.size) : 'Unknown size'}</div>
                `;
                indexedFilesList.appendChild(fileItem);
            });
        } else {
            indexedFileCount = 0;
            indexedFilesList.innerHTML = '<div class="no-indexed-files">No indexed files found</div>';
        }
        
        // Update upload area state based on indexed file count
        updateUploadAreaState();
    }

    async function clearAllData() {
        if (!confirm('Are you sure you want to clear all uploaded files and index data? This action cannot be undone.')) {
            return;
        }

        clearAllBtn.disabled = true;
        clearAllBtn.textContent = 'Clearing...';

        try {
            // Clear local storage
            await clearLocalStorage();
            
            // Clear backend data for this user session
            const response = await fetch(`${API_BASE_URL}/clear?userSessionId=${userSessionId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('All data cleared successfully!');
                indexedFileCount = 0;
                clearFiles();
                loadIndexedFiles();
                searchResults.innerHTML = '';
            } else {
                alert('Failed to clear server data: ' + data.error);
            }
        } catch (error) {
            alert('Failed to clear data: ' + error.message);
        } finally {
            clearAllBtn.disabled = false;
            clearAllBtn.textContent = 'Clear All Data';
        }
    }

    async function clearLocalStorage() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async function downloadIndex() {
        downloadIndexBtn.disabled = true;
        downloadIndexBtn.textContent = 'Preparing...';

        try {
            const response = await fetch(`${API_BASE_URL}/download-index?userSessionId=${userSessionId}`, {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Failed to download index');
            }
            
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `index_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert('Failed to download index: ' + error.message);
        } finally {
            downloadIndexBtn.disabled = false;
            downloadIndexBtn.textContent = 'Download Index';
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function handleDonation() {
        // You can replace this URL with your preferred donation platform
        const donationUrl = 'https://www.paypal.com/paypalme/irissmile'; // Replace with your actual donation link
        
        // Open donation link in new tab
        chrome.tabs.create({ url: donationUrl });
        
        // Optional: Show a thank you message
        showThankYouMessage();
    }

    function showThankYouMessage() {
        const originalText = donateBtn.textContent;
        donateBtn.textContent = 'Thank you! ❤️';
        donateBtn.disabled = true;
        
        setTimeout(() => {
            donateBtn.textContent = originalText;
            donateBtn.disabled = false;
        }, 2000);
    }
}
