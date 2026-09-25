export const Pill = ({ description }: { description: string }) => {
  return (
    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
      {description}
    </span>
  );
};
