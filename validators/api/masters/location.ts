import { z } from "zod";

const locationImportRowValidator = z.object({
  city: z.string().min(1, "city is required"),
  state: z.string().min(1, "state is required"),
  country: z.string().min(1, "country is required"),
  postcode: z.string().min(1, "postcode is required"),
});

const locationValidator = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postcode: z.string().min(1, "Post Code is required"),
});

const partialLocationValidator = locationValidator.extend({
  id: z.number().min(1, "Location Id is required"),
});

type LocationValidatorType = z.infer<typeof locationValidator>;
type LocationImportRow = z.infer<typeof locationImportRowValidator>;
type PartialLocationValidatorType = z.infer<typeof partialLocationValidator>;

export {
  locationValidator,
  partialLocationValidator,
  locationImportRowValidator,
};
export type {
  LocationImportRow,
  LocationValidatorType,
  PartialLocationValidatorType,
};
