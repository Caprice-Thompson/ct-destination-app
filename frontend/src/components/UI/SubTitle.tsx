export const SubTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2 className={`text-3xl font-bold text-gray-900 mb-3 ${className || ""}`}>
      {children}
    </h2>
  );
};
