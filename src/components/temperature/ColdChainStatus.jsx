

export default function ColdChainStatus({ history, tempMin, tempMax }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '1rem', background: '#e0e0e0', borderRadius: '8px', textAlign: 'center' }}>
        <h3>Cold Chain Status</h3>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>NO DATA</p>
      </div>
    );
  }

  const hasExcursion = history.some(reading => {
    const temp = Number(reading.temperature);
    return temp < tempMin || temp > tempMax;
  });

  return (
    <div style={{ 
      padding: '1rem', 
      background: hasExcursion ? '#ffebee' : '#e8f5e9', 
      borderRadius: '8px', 
      textAlign: 'center',
      border: `2px solid ${hasExcursion ? '#f44336' : '#4caf50'}`
    }}>
      <h3 style={{ color: hasExcursion ? '#d32f2f' : '#2e7d32' }}>Cold Chain Status</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: hasExcursion ? '#d32f2f' : '#2e7d32' }}>
        {hasExcursion ? 'EXCURSION DETECTED' : 'SAFE / IN RANGE'}
      </p>
    </div>
  );
}
