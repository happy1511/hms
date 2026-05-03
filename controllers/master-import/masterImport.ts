import { User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import {
  MASTER_IMPORT_CONFIG,
  MasterImportKey,
} from "@/lib/masterImportConfig";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { importByMaster } from "@/lib/masterImportService";
import { bedImportRowValidator } from "@/validators/api/masters/bed";
import { billingSectionImportRowValidator } from "@/validators/api/masters/billingSection";
import { departmentImportRowValidator } from "@/validators/api/masters/department";
import { doctorImportRowValidator } from "@/validators/api/masters/doctor";
import { drugImportRowValidator } from "@/validators/api/masters/drug";
import { drugBillingCategoryImportRowValidator } from "@/validators/api/masters/drugBillingCategory";
import { financeCategoryImportRowValidator } from "@/validators/api/masters/financeCategory";
import { hsnSacImportRowValidator } from "@/validators/api/masters/hsnSac";
import { locationImportRowValidator } from "@/validators/api/masters/location";
import { appendReplaceModeValidator } from "@/validators/api/masters/masterImport";
import { pathologyTestImportRowValidator } from "@/validators/api/masters/pathologyTest";
import {
  radiologyTemplateImportRowValidator,
  radiologyTestImportRowValidator,
} from "@/validators/api/masters/radiologyTest";
import { roomImportRowValidator } from "@/validators/api/masters/room";
import { roomTypeImportRowValidator } from "@/validators/api/masters/roomType";
import { serviceImportRowValidator } from "@/validators/api/masters/service";
import { supplierImportRowValidator } from "@/validators/api/masters/supplier";
import csv from "csvtojson";
import { z } from "zod";

const getMasterKey = (value: string): MasterImportKey | null => {
  if (value in MASTER_IMPORT_CONFIG) {
    return value as MasterImportKey;
  }
  return null;
};

const rowSchemaMap: Record<MasterImportKey, z.ZodTypeAny> = {
  "billing-section": billingSectionImportRowValidator,
  doctor: doctorImportRowValidator,
  drug: drugImportRowValidator,
  "drug-category": drugBillingCategoryImportRowValidator,
  supplier: supplierImportRowValidator,
  department: departmentImportRowValidator,
  "finance-category": financeCategoryImportRowValidator,
  "hsn-sac": hsnSacImportRowValidator,
  location: locationImportRowValidator,
  "room-type": roomTypeImportRowValidator,
  room: roomImportRowValidator,
  bed: bedImportRowValidator,
  service: serviceImportRowValidator,
  "pathology-test": pathologyTestImportRowValidator,
  "radiology-test": radiologyTestImportRowValidator,
  "radiology-template": radiologyTemplateImportRowValidator,
};

type ValidatedImportRow = {
  __rowNumber: string;
} & Record<string, unknown>;

const parseCsvToJson = async (content: string) => {
  const [headerLine = ""] = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const delimiter = headerLine.includes("\t") ? "\t" : ",";

  const rows = await csv({
    trim: true,
    delimiter,
  }).fromString(content);

  return rows.map((row, index) => {
    const normalizedRow = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        String(key).trim(),
        typeof value === "string" ? value.trim() : value,
      ]),
    );

    return {
      __rowNumber: String(index + 2),
      ...(normalizedRow as Record<string, unknown>),
    };
  });
};

export const createAPI = async (
  req: Request,
  { params }: { params: { master: string } },
  user: User,
) => {
  const master = getMasterKey(params.master);

  if (!master) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "Invalid master selected",
    });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const modeResult = appendReplaceModeValidator.safeParse(
    String(formData.get("mode") || "append"),
  );

  if (!modeResult.success) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "Invalid import mode",
      data: modeResult.error.issues[0]?.message,
    });
  }

  if (!(file instanceof File)) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "CSV file is required",
    });
  }

  const content = await file.text();
  const rawRows = await parseCsvToJson(content);

  if (!rawRows.length) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "The uploaded CSV file is empty",
    });
  }

  const rowSchema = rowSchemaMap[master];
  const validatedRows: ValidatedImportRow[] = [];

  for (const rawRow of rawRows) {
    const parsed = rowSchema.safeParse(rawRow);

    if (!parsed.success) {
      return apiResponse({
        status: RESPONSE_STATUS.BAD_REQUEST,
        message: `Row ${rawRow.__rowNumber}: validation failed`,
        data: parsed.error.issues[0]?.message ?? "validation failed",
      });
    }

    validatedRows.push({
      __rowNumber: rawRow.__rowNumber,
      ...(parsed.data as Record<string, unknown>),
    });
  }

  const result = await importByMaster(
    master,
    validatedRows,
    modeResult.data,
    user.id,
  );

  return apiResponse({
    status: RESPONSE_STATUS.SUCCESS,
    message: `${MASTER_IMPORT_CONFIG[master].title} imported successfully`,
    data: {
      ...result,
      total: validatedRows.length,
    },
  });
};
