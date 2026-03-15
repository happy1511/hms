const Cell = ({
  children,
  className = "",
  as = "td",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "td" | "th";
  colSpan?: number;
}) => {
  const Component = as;

  return (
    <Component
      colSpan={colSpan}
      className={`border text-inherit border-black px-1.5 py-1 align-middle font-normal ${className}`}
    >
      {children}
    </Component>
  );
};

export default Cell;
