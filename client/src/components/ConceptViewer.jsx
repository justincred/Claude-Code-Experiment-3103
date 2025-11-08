import React from 'react';
import { FiArrowLeft, FiArrowRight, FiBook } from 'react-icons/fi';
import './ConceptViewer.css';

function ConceptViewer({ document, concepts, onBack, onStartQuiz }) {
  return (
    <div className="concept-viewer">
      <button className="btn btn-secondary back-btn" onClick={onBack}>
        <FiArrowLeft /> Back to Documents
      </button>

      <div className="concepts-header">
        <h1>📖 {document.filename.replace('.pdf', '')}</h1>
        <p className="concepts-count">
          {concepts.length} key concepts extracted
        </p>
      </div>

      <div className="concepts-grid">
        {concepts.map((concept, index) => (
          <div key={concept.id} className="concept-card">
            <div className="concept-number">{index + 1}</div>
            <h3>{concept.title}</h3>
            <p className="concept-explanation">{concept.explanation}</p>
            <div className="concept-footer">
              <span className="badge">5 Questions</span>
            </div>
          </div>
        ))}
      </div>

      <div className="concepts-action">
        <button className="btn btn-primary btn-large" onClick={onStartQuiz}>
          <FiArrowRight /> Start Quiz Mode
        </button>
      </div>
    </div>
  );
}

export default ConceptViewer;
