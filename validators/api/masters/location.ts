import { z } from "zod";

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
type PartialLocationValidatorType = z.infer<typeof partialLocationValidator>;

export { locationValidator, partialLocationValidator };
export type { LocationValidatorType, PartialLocationValidatorType };
