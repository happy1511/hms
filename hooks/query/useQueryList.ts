import { QueryKey, useQueryClient } from "@tanstack/react-query";

type value = string | boolean | number | object | null | undefined;

type ObjectKey<T> = keyof T;

export function useQueryList<T extends Record<string, value>>(
  queryKey: QueryKey,
) {
  const queryClient = useQueryClient();

  const getList = (): T[] => queryClient.getQueryData<T[]>(queryKey) ?? [];

  const setList = (updater: (old: T[]) => T[]) => {
    queryClient.setQueryData<T[]>(queryKey, (old) => updater(old ?? []));
  };

  const create = (item: T, key: ObjectKey<T>) => {
    setList((old) => {
      const exists = old.some((i) => i[key] === item[key]);
      return exists ? old : [...old, item];
    });
  };

  const update = (
    keyValue: T[keyof T],
    updates: Partial<T>,
    key: ObjectKey<T>,
  ) => {
    setList((old) =>
      old.map((item) =>
        item[key] === keyValue ? { ...item, ...updates } : item,
      ),
    );
  };

  const remove = (keyValue: T[keyof T], key: ObjectKey<T>) => {
    setList((old) => old.filter((item) => item[key] !== keyValue));
  };

  const replace = (list: T[]) => {
    queryClient.setQueryData<T[]>(queryKey, list);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    list: getList(),
    getList,
    create,
    update,
    remove,
    replace,
    invalidate,
  };
}
