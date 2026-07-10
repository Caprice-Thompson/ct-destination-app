interface TextTitleProps {
  description: string;
}
export const TextTitle = ({ description }: TextTitleProps) => {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
      {description}
    </p>
  );
};
