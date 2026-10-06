export default function Loader() { 
  return (
    <div className="flex justify-center items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-primary-500 animate-pulse"></div>
      <div className="w-4 h-4 rounded-full bg-secondary-500 animate-pulse delay-75"></div>
      <div className="w-4 h-4 rounded-full bg-primary-400 animate-pulse delay-150"></div>
    </div>
  ); 
}
