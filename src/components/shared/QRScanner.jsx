import { useState, useRef } from 'react';
import jsQR from 'jsqr';

export default function QRScanner({ onScan }) {
  const [scanError, setScanError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanError('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          onScan(code.data);
        } else {
          setScanError('No readable QR code found in the uploaded image.');
        }
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
      />
      <button 
        type="button" 
        onClick={() => fileInputRef.current?.click()}
        style={{ 
          padding: '0.5rem 1rem', 
          background: '#007bff', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        📷 Scan QR Image File
      </button>
      {scanError && (
        <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          {scanError}
        </div>
      )}
    </div>
  );
}
