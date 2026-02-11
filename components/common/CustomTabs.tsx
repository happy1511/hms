import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface Props {
  tabs: {
    value: string;
    name: string;
    content: ReactNode;
  }[];
  defaultValue: string;
  buttons?: ReactNode;
}

const CustomTabs = ({ tabs, defaultValue, buttons }: Props) => {
  return (
    <Tabs
      className="border border-pink-200 shadow-md bg-white p-3"
      defaultValue={defaultValue}
    >
      <div className="border-b border-primary flex justify-between items-end">
        <TabsList className="bg-white">
          {tabs.map((tab, i) => (
            <TabsTrigger
              className="rounded-t-3xl text-tiny data-[state=active]:text-white data-[state=active]:bg-linear-to-b from-primary to-primary/80 "
              key={i}
              value={tab.value}
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {buttons && buttons}
      </div>
      {tabs.map((tab, i) => (
        <TabsContent key={i} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CustomTabs;
