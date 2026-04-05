import { z } from "zod";

const appendReplaceModeValidator = z.enum(["append", "replace"]);

type MasterImportModeType = z.infer<typeof appendReplaceModeValidator>;

export { appendReplaceModeValidator };
export type { MasterImportModeType };
