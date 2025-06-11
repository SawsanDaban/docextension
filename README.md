# Document File Index Search

A powerful Chrome extension for uploading, indexing, and searching through document files using Apache Lucene.

## 🎯 Features

- 📄 **Multi-format Support**: PDF, DOC, DOCX, and TXT files
- 🔍 **Full-text Search**: Powered by Apache Lucene indexing
- 📁 **File Management**: Upload, view, and manage indexed documents
- 🗑️ **Data Management**: Clear all data and download search index
- ☁️ **Cloud Storage**: Secure server-side processing and storage
- 🔒 **Privacy First**: Complete user data isolation
- ❤️ **Open Source**: Support the project through donations

## 📁 Supported File Types

- **PDF**: Full text extraction and indexing
- **TXT**: Plain text file indexing
- **DOC/DOCX**: Microsoft Word documents (filename indexing)

## 🚀 Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder (`doc-browser-extension`)
5. Start uploading and searching your documents!

## 💻 Usage

1. **Upload Documents**: Drag and drop or click to browse files (max 5 files, 10MB each)
2. **Search Content**: Enter keywords to search through all indexed documents
3. **Manage Files**: View indexed files and clear data when needed
4. **Download Index**: Export your search index for backup

## 🛠️ Technical Stack

- **Frontend**: Chrome Extension (HTML, CSS, JavaScript)
- **Backend**: Java Spring Boot with Apache Lucene
- **Document Processing**: Apache PDFBox for PDF text extraction
- **Deployment**: Docker on DigitalOcean
- **CI/CD**: GitHub Actions

## 🔒 Privacy & Security

- All file processing happens on your secure server
- Complete user data isolation using unique session IDs
- No data is shared with third parties
- Files are sanitized and validated before processing
- Secure communication over HTTPS

## 🌐 Development

This extension connects to a backend server at `docextension.irissmile.studio` for document processing and search functionality.

## ❤️ Support This Project

If you find this extension useful, consider supporting its development:

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/irissmile)
[![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/irissmile)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/irissmile)

### 💖 Why Support?

- 🚀 **Server Costs**: Help maintain the backend infrastructure
- ⚡ **New Features**: Fund development of advanced search capabilities
- 🔧 **Bug Fixes**: Ensure fast resolution of issues
- 📈 **Improvements**: Support ongoing performance optimizations

Your support helps keep this project free and continuously improving!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request to the public extension repository:

**Extension Frontend**: [GitHub Repository](https://github.com/SawsanDaban/docextension)

## 📄 License

Open source project - feel free to contribute and improve!

---

<div align="center">

**Made with ❤️ for the community**

[Report Issues](https://github.com/SawsanDaban/docextension/issues) • [Privacy Policy](https://docextension.irissmile.studio/privacy-policy) • [Support](https://www.paypal.com/paypalme/irissmile)

</div>
