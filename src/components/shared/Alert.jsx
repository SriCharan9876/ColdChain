export default function Alert({ message, type = 'info' }) {
  if (!message) return null;
  
  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-orange-50 text-orange-800 border-orange-200'
  };

  const icons = {
    error: '⚠️',
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️'
  };

  return (
    <div className={`p-4 mb-4 rounded-lg border flex items-start gap-3 ${styles[type] || styles.info}`}>
      <span className="text-lg leading-none">{icons[type] || icons.info}</span>
      <div className="text-sm font-medium leading-tight pt-0.5">{message}</div>
    </div>
  );
}
