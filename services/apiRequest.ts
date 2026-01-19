/* ===================== TYPES ===================== */

import axiosInstance from "./axios";

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export const API_METHODS: Record<HTTPMethod, HTTPMethod> = {
  GET: "GET",
  POST: "POST",
  DELETE: "DELETE",
  PUT: "PUT",
  PATCH: "PATCH",
};

type Primitive = string | number | boolean;
type FormDataValue =
  | Primitive
  | File
  | null
  | undefined
  | FormDataValue[]
  | { [key: string]: FormDataValue };

/* ===================== REQUEST MAKER ===================== */

export const createRequest =
  <
    Resp,
    Params extends Record<string, unknown> | undefined = undefined,
    UrlHelpers extends Record<string, unknown> | undefined = undefined,
    Body = unknown,
  >(
    url: string | ((p: UrlHelpers) => string),
    method: HTTPMethod,
    asFormData = false,
  ) =>
  async ({
    params,
    body,
    pageParam,
    urlHelpers,
  }: {
    params?: Params;
    body?: Body;
    pageParam?: number;
    urlHelpers?: UrlHelpers;
  }): Promise<Resp> => {
    const finalUrl =
      typeof url === "function" ? url(urlHelpers as UrlHelpers) : url;

    const data = asFormData && body ? toFormData(body as FormDataValue) : body;

    const res = await axiosInstance.request<Resp>({
      url: finalUrl,
      method,
      params: {
        ...(params ?? {}),
        ...(pageParam !== undefined ? { page: pageParam } : {}),
      },
      data,
    });

    return res.data;
  };

/* ===================== FORM DATA ===================== */

export const toFormData = (obj: FormDataValue): FormData => {
  const formData = new FormData();

  const build = (value: FormDataValue, key?: string): void => {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      if (key) formData.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v, i) => build(v, key ? `${key}[${i}]` : String(i)));
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([k, v]) =>
        build(v, key ? `${key}[${k}]` : k),
      );
      return;
    }

    if (key) {
      formData.append(key, String(value));
    }
  };

  build(obj);
  return formData;
};
