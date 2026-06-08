import { z } from "zod";
import { paginationValidator } from "../common/pagination";

const locationImportRowValidator = z.object({
  city: z.string().min(1, "city is required"),
  state: z.string().min(1, "state is required"),
  country: z.string().min(1, "country is required"),
  postcode: z.string().min(1, "postcode is required"),
  postName: z.string().min(1, "postName is required"),
});

const locationValidator = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postcode: z.string().min(1, "Post Code is required"),
  postName: z.string().min(1, "Post Name is required"),
});

const partialLocationValidator = locationValidator.partial().extend({
  id: z.number().min(1, "Location Id is required"),
});

const locationQueryValidator = paginationValidator.extend({
  field: z.enum(["country", "state", "city", "postcode", "postName"]).optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  postName: z.string().optional(),
});

type LocationValidatorType = z.infer<typeof locationValidator>;
type LocationImportRow = z.infer<typeof locationImportRowValidator>;
type PartialLocationValidatorType = z.infer<typeof partialLocationValidator>;
type LocationQueryValidatorType = z.infer<typeof locationQueryValidator>;

export {
  locationValidator,
  partialLocationValidator,
  locationImportRowValidator,
  locationQueryValidator,
};
export type {
  LocationImportRow,
  LocationValidatorType,
  PartialLocationValidatorType,
  LocationQueryValidatorType,
};
