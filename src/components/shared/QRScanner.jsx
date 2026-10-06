import { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function QRScanner({ onScan }) {
  const [scanError, setScanError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to decode QR from an HTML Canvas with multi-resolution fallback
  const decodeCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) return code.data;

    // Try again with inverted colors (for dark mode QR or reflective images)
    code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });
    if (code && code.data) return code.data;

    // Downscale fallback for large images
    const maxDim = Math.max(canvas.width, canvas.height);
    if (maxDim > 800) {
      const scale = 800 / maxDim;
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = Math.floor(canvas.width * scale);
      scaledCanvas.height = Math.floor(canvas.height * scale);
      const scaledCtx = scaledCanvas.getContext('2d');
      scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      
      const scaledData = scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
      const scaledCode = jsQR(scaledData.data, scaledData.width, scaledData.height, {
        inversionAttempts: 'attemptBoth'
      });
      if (scaledCode && scaledCode.data) return scaledCode.data;
    }

    return null;
  };

  // Uploaded Image File Processing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanError('');
    setIsCameraActive(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const result = decodeCanvas(canvas);
        if (result) {
          onScan(result);
        } else {
          setScanError('No readable QR code found. Please ensure the QR code is clear and well-lit.');
        }
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCameraScan = (result) => {
    if (result && result.length > 0) {
      setIsCameraActive(false);
      onScan(result[0].rawValue);
    }
  };

  return (
    <div style={{ margin: '1rem 0', textAlign: 'center', width: '100%' }}>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
      />
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {!isCameraActive ? (
          <button 
            type="button" 
            onClick={() => {
              setScanError('');
              setIsCameraActive(true);
            }}
            style={{ 
              padding: '0.6rem 1.2rem', 
              background: '#28a745', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          >
            📷 Start Camera Scan
          </button>
        ) : (
          <button 
            type="button" 
            onClick={() => setIsCameraActive(false)}
            style={{ 
              padding: '0.6rem 1.2rem', 
              background: '#dc3545', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          >
            ❌ Stop Camera
          </button>
        )}

        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            padding: '0.6rem 1.2rem', 
            background: '#007bff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 600
          }}
        >
          🖼️ Upload QR Image
        </button>
      </div>

      {isCameraActive && (
        <div style={{ 
          marginTop: '1rem', 
          width: '100%', 
          maxWidth: '350px', 
          margin: '1rem auto 0 auto',
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '2px solid #28a745'
        }}>
          <Scanner 
            onScan={handleCameraScan} 
            onError={(err) => {
              console.error(err);
              setScanError('Camera error: Unable to access device camera.');
              setIsCameraActive(false);
            }}
            formats={['qr_code']}
          />
        </div>
      )}

      {scanError && (
        <div style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '0.5rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>
          {scanError}
        </div>
      )}
    </div>
  );
}
