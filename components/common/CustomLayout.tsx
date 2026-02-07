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
      <div className="bg-accent border-b border-pink-200 text-black text-sm p-1 flex w-full justify-between items-center">
        <div>{title}</div>
        {!!buttons && buttons}
      </div>
      <div className="p-3 bg-white">{children}</div>
    </div>
  );
};

export default CustomLayout;
