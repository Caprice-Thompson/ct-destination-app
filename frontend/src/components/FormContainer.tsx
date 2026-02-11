type FormContainerProps = {
  className?: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  children?: React.ReactNode;
};

export function FormContainer({ className, onSubmit, children }: FormContainerProps) {
  return (
    <form
      className={`mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md ${className}`}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
}
