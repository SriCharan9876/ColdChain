

export default function Alert({ message, type }) {
  const color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue';
  return (
    <div style={{ color, border: '1px solid ' + color, padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
      {message}
    </div>
  );
}
