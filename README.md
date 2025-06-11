# Document File Index Search

A powerful Chrome extension for uploading, indexing, and searching through document files using Apache Lucene.

## Features

- 📄 **Multi-format Support**: PDF, DOC, DOCX, and TXT files
- 🔍 **Full-text Search**: Powered by Apache Lucene indexing
- 📁 **File Management**: Upload, view, and manage indexed documents
- 🗑️ **Data Management**: Clear all data and download search index
- ☁️ **Cloud Storage**: Secure server-side processing and storage
- ❤️ **Open Source**: Support the project through donations

## Supported File Types

- **PDF**: Full text extraction and indexing
- **TXT**: Plain text file indexing
- **DOC/DOCX**: Microsoft Word documents (filename indexing)

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. Start uploading and searching your documents!

## Usage

1. **Upload Documents**: Drag and drop or click to browse files (max 5 files, 10MB each)
2. **Search Content**: Enter keywords to search through all indexed documents
3. **Manage Files**: View indexed files and clear data when needed
4. **Download Index**: Export your search index for backup

## Technical Stack

- **Frontend**: Chrome Extension (HTML, CSS, JavaScript)
- **Backend**: Java Spring Boot with Apache Lucene
- **Document Processing**: Apache PDFBox for PDF text extraction
- **Deployment**: Docker on DigitalOcean
- **CI/CD**: GitHub Actions

## Privacy & Security

- All file processing happens on your secure server
- No data is shared with third parties
- Files are sanitized and validated before processing
- Secure communication over HTTPS

## Development

This extension connects to a backend server at `docextension.irissmile.studio` for document processing and search functionality.

## Support

If you find this extension useful, consider supporting the development through the donation button in the extension.

## License

Open source project - feel free to contribute and improve!
