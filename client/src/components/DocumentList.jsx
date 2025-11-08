import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBook, FiPlayCircle, FiTrendingUp } from 'react-icons/fi';
import './DocumentList.css';

function DocumentList({ documents, onProcess, onQuiz, onProgress }) {
  const [availablePdfs, setAvailablePdfs] = useState([]);
  const [processingFile, setProcessingFile] = useState(null);

  useEffect(() => {
    fetchAvailablePdfs();
  }, []);

  const fetchAvailablePdfs = async () => {
    try {
      const response = await axios.get('/api/pdf/available');
      setAvailablePdfs(response.data.pdfs);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  const handleProcess = async (filename) => {
    setProcessingFile(filename);
    try {
      await onProcess(filename);
    } finally {
      setProcessingFile(null);
    }
  };

  const unprocessedPdfs = availablePdfs.filter(
    pdf => !documents.some(doc => doc.filename === pdf.filename)
  );

  return (
    <div className="document-list">
      {unprocessedPdfs.length > 0 && (
        <section className="unprocessed-section">
          <h2>📄 Available Lecture Materials</h2>
          <p className="subtitle">Click to extract concepts and generate study questions</p>
          <div className="pdf-grid">
            {unprocessedPdfs.map((pdf) => (
              <div key={pdf.filename} className="pdf-card">
                <div className="pdf-icon">
                  <FiBook size={32} />
                </div>
                <h3>{pdf.filename.replace('.pdf', '')}</h3>
                <p className="pdf-size">
                  {(pdf.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleProcess(pdf.filename)}
                  disabled={processingFile === pdf.filename}
                >
                  {processingFile === pdf.filename ? 'Processing...' : 'Extract Content'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {documents.length > 0 && (
        <section className="processed-section">
          <h2>✅ Processed Materials</h2>
          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="doc-header">
                  <h3>{doc.filename.replace('.pdf', '')}</h3>
                  <span className="doc-date">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="doc-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => onQuiz(doc.id)}
                  >
                    <FiPlayCircle /> Start Quiz
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onProgress(doc.id)}
                  >
                    <FiTrendingUp /> View Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {unprocessedPdfs.length === 0 && documents.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>No materials available</h2>
          <p>Place your PDF lecture files in the project root directory to get started</p>
        </div>
      )}
    </div>
  );
}

export default DocumentList;
