import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DocumentList from './components/DocumentList';
import ConceptViewer from './components/ConceptViewer';
import QuizMode from './components/QuizMode';
import ProgressTracker from './components/ProgressTracker';
import './App.css';

function App() {
  const [view, setView] = useState('documents'); // documents, concepts, quiz, progress
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/pdf/documents');
      setDocuments(Array.isArray(response.data) ? response.data : response.data.documents || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDocument = async (filename) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/pdf/process', { filename });
      setSelectedDocument({
        id: response.data.documentId,
        filename: response.data.filename
      });
      setConcepts(response.data.concepts);
      setView('concepts');
      setError(null);

      // Refresh document list
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error processing document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (documentId) => {
    setSelectedDocument({ id: documentId });
    setView('quiz');
  };

  const handleViewProgress = (documentId) => {
    setSelectedDocument({ id: documentId });
    setView('progress');
  };

  const handleBack = () => {
    setView('documents');
    setSelectedDocument(null);
    setConcepts([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Quiz Study Tool</h1>
        <p>Maximize your learning with AI-powered study materials</p>
      </header>

      <main className="app-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        {!loading && view === 'documents' && (
          <DocumentList
            documents={documents}
            onProcess={handleProcessDocument}
            onQuiz={handleStartQuiz}
            onProgress={handleViewProgress}
          />
        )}

        {!loading && view === 'concepts' && selectedDocument && (
          <ConceptViewer
            document={selectedDocument}
            concepts={concepts}
            onBack={handleBack}
            onStartQuiz={() => handleStartQuiz(selectedDocument.id)}
          />
        )}

        {!loading && view === 'quiz' && selectedDocument && (
          <QuizMode
            documentId={selectedDocument.id}
            onBack={handleBack}
          />
        )}

        {!loading && view === 'progress' && selectedDocument && (
          <ProgressTracker
            documentId={selectedDocument.id}
            onBack={handleBack}
            onQuiz={() => setView('quiz')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
