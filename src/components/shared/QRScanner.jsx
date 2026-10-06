import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

export default function QRScanner({ onScan }) {
  const [scanError, setScanError] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameId = useRef(null);

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

    // If image is very large, downscale to max 800px for jsQR matrix scan
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

  // Live Camera Scan Loop
  const scanCameraFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        stopCamera();
        onScan(code.data);
        return;
      }
    }
    animationFrameId.current = requestAnimationFrame(scanCameraFrame);
  };

  const startCamera = async () => {
    setScanError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', true);
        videoRef.current.play();
      }
      setIsCameraActive(true);
      animationFrameId.current = requestAnimationFrame(scanCameraFrame);
    } catch (err) {
      console.error('Camera access error:', err);
      setScanError('Unable to access camera. Please check camera permissions or upload an image file.');
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
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
            onClick={startCamera}
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
            onClick={stopCamera}
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
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '320px', 
            borderRadius: '8px', 
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '2px solid #28a745'
          }}>
            <video 
              ref={videoRef} 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px dashed rgba(255,255,255,0.8)',
              margin: '20px',
              pointerEvents: 'none'
            }} />
          </div>
          <span style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem' }}>
            Point your camera at a Medicine QR code
          </span>
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
