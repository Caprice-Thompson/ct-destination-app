export function SubTitle({ description }: { description: string }) {
  return (
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 tracking-wide uppercase">
      {description}
    </p>
  );
}
