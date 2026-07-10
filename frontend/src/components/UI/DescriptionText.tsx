export const DescriptionText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p className={`text-gray-600 text-lg leading-relaxed ${className || ""}`}>
      {children}
    </p>
  );
};
