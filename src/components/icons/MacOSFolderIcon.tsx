export function MacOSFolderIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="folderBack" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#4bc0f5"/>
          <stop offset="100%" stopColor="#0b83d9"/>
        </linearGradient>
        <linearGradient id="folderFront" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#81d8fc"/>
          <stop offset="100%" stopColor="#1494eb"/>
        </linearGradient>
      </defs>
      
      {/* Back tab */}
      <path 
        d="M5 15C5 9.477 9.477 5 15 5H35.5C38.285 5 40.941 6.162 42.84 8.25L47.5 13.38c.633.696 1.519 1.094 2.455 1.094H85c5.523 0 10 4.477 10 10v10H5V15z" 
        fill="url(#folderBack)" 
      />
      
      {/* Front cover */}
      <path 
        d="M2 28.5C2 24.358 5.358 21 9.5 21H90.5c4.142 0 7.5 3.358 7.5 7.5V67.5c0 4.142-3.358 7.5-7.5 7.5H9.5C5.358 75 2 71.642 2 67.5V28.5z" 
        fill="url(#folderFront)" 
      />
    </svg>
  );
}
