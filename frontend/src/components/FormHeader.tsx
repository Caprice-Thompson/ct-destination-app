type FormHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export const FormHeader = ({ title, description, className }: FormHeaderProps) => {
  return (
    <div>
      <h2 className={`mt-6 text-center text-3xl text-gray-900 dark:text-white ${className}`}>
        {title}
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
};
