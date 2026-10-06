

export default function TemperatureHistory({ history, tempMin, tempMax }) {
  if (!history || history.length === 0) {
    return <p>No temperature readings recorded.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '0.5rem' }}>#</th>
            <th style={{ padding: '0.5rem' }}>Time</th>
            <th style={{ padding: '0.5rem' }}>Temperature</th>
            <th style={{ padding: '0.5rem' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((reading, index) => {
            const temp = Number(reading.temperature);
            const isExcursion = temp < tempMin || temp > tempMax;
            return (
              <tr key={index} style={{ borderBottom: '1px solid #eee', background: isExcursion ? '#ffebee' : 'transparent' }}>
                <td style={{ padding: '0.5rem' }}>{index + 1}</td>
                <td style={{ padding: '0.5rem' }}>{new Date(Number(reading.timestamp) * 1000).toLocaleString()}</td>
                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{temp}°C</td>
                <td style={{ padding: '0.5rem', color: isExcursion ? 'red' : 'green', fontWeight: 'bold' }}>
                  {isExcursion ? 'EXCURSION' : 'IN RANGE'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
