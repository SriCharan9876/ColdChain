import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeDisplay({ value, size = 160 }) {
  if (!value) return null;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      width: 'fit-content',
      margin: '0 auto'
    }}>
      <QRCodeSVG value={String(value)} size={size} level="H" includeMargin={true} />
      <span style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.5rem', fontWeight: 600 }}>
        QR Code (ID: {value})
      </span>
    </div>
  );
}
