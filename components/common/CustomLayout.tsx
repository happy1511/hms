const CustomLayout = ({
  children,
  title,
  buttons,
}: {
  children: React.ReactNode;
  title: string;
  buttons?: React.ReactNode;
}) => {
  return (
    <div className="border border-pink-200 shadow-md">
      <div className="bg-pink-50 border-b border-pink-200 text-black/60 text-sm p-1 flex w-full justify-between items-center">
        <div>{title}</div>
        {!!buttons && buttons}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
};

export default CustomLayout;
