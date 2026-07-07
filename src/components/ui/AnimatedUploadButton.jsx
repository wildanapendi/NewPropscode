import React, { useState } from 'react';
import './AnimatedUploadButton.css';

const AnimatedUploadButton = ({ onChange, accept, fileName }) => {
  const [hasFile, setHasFile] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHasFile(true);
    } else {
      setHasFile(false);
    }
    if (onChange) onChange(e);
  };

  // Revert state if externally cleared
  React.useEffect(() => {
    if (!fileName) setHasFile(false);
    else setHasFile(true);
  }, [fileName]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      <label className={`animated-upload-wrapper ${hasFile ? 'has-file' : ''}`} style={{ flexShrink: 0 }}>
        <input 
          type="file" 
          className="hidden-input" 
          accept={accept} 
          onChange={handleFileChange} 
        />
        
        <svg viewBox="0 0 160 48" preserveAspectRatio="none">
          {/* Base border */}
          <rect className="border" x="2" y="2" width="156" height="44" />
          
          {/* Loading border - appears on finish */}
          <rect className="loading" x="2" y="2" width="156" height="44" />
          
          {/* Cloud icon - appears on finish */}
          <path 
            className="done done-cloud" 
            d="M 50,30 
               A 6,6 0 0,1 60,20 
               A 10,10 0 0,1 80,20 
               A 8,8 0 0,1 94,22 
               A 6,6 0 0,1 106,30 
               Z" 
            strokeWidth="2"
          />
          
          {/* Checkmark icon - appears on finish */}
          <path 
            className="done done-check" 
            d="M 70,26 L 76,32 L 88,18" 
            strokeWidth="3"
          />
        </svg>
        
        <div className="txt-upload"></div>
      </label>
      
      <div style={{
        flexGrow: 1,
        padding: '0.75rem 1.25rem',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        color: hasFile ? 'var(--text-primary)' : 'var(--text-muted)',
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {fileName ? fileName : 'Belum ada file yang dipilih...'}
      </div>
    </div>
  );
};

export default AnimatedUploadButton;
