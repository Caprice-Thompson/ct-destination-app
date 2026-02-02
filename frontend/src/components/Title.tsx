export function Title({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h1 className={`text-7xl font-bold ${className || ''}`}>{children}</h1>
  );
}