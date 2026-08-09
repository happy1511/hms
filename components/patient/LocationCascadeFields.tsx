import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Location } from "@/generated/prisma/client";
import { useInfiniteLocationOptionsList } from "@/hooks/query/locations";
import {
  LocationFieldName,
  LocationOption,
  PaginatedResponse,
} from "@/lib/type";
import { useCallback, useEffect, useRef, useState } from "react";
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

type LocationCascadeState = {
  country: LocationOption | null;
  state: LocationOption | null;
  city: LocationOption | null;
  postcode: LocationOption | null;
  postName: LocationOption | null;
};

const getLocationValue = (
  option: LocationOption | null | undefined,
  field: LocationFieldName,
) => option?.[field] ?? "";

const buildOption = (
  field: LocationFieldName,
  value?: string | null,
): LocationOption | null => (value ? { [field]: value } : null);

const buildStateFromLocation = (
  location?: Location | null,
): LocationCascadeState => ({
  country: buildOption("country", location?.country),
  state: buildOption("state", location?.state),
  city: buildOption("city", location?.city),
  postcode: buildOption("postcode", location?.postcode),
  postName: location?.postName ? location : null,
});

const LocationCascadeFields = <TFieldValues extends FieldValues>({
  form,
  name,
  required = false,
}: {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  required?: boolean;
}) => {
  const selectedLocation =
    (form.watch(name) as Location | null | undefined) ?? null;
  const syncRef = useRef(false);
  const skipNextExternalSyncRef = useRef(false);
  const [postcodeFirstMode, setPostcodeFirstMode] = useState(false);

  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [postcodeSearch, setPostcodeSearch] = useState("");
  const [postNameSearch, setPostNameSearch] = useState("");

  const cascadeForm = useForm<LocationCascadeState>({
    defaultValues: buildStateFromLocation(selectedLocation),
  });

  const country = cascadeForm.watch("country");
  const state = cascadeForm.watch("state");
  const city = cascadeForm.watch("city");
  const postcode = cascadeForm.watch("postcode");
  const postName = cascadeForm.watch("postName");

  const countryValue = getLocationValue(country, "country");
  const stateValue = getLocationValue(state, "state");
  const cityValue = getLocationValue(city, "city");
  const postcodeValue = getLocationValue(postcode, "postcode");

  const clearSelectedLocation = useCallback(() => {
    skipNextExternalSyncRef.current = true;
    form.setValue(name, null as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form, name]);

  const clearFields = useCallback(
    (fields: LocationFieldName[]) => {
      fields.forEach((field) => cascadeForm.setValue(field, null));
      clearSelectedLocation();
    },
    [cascadeForm, clearSelectedLocation],
  );

  useEffect(() => {
    if (skipNextExternalSyncRef.current && !selectedLocation) {
      skipNextExternalSyncRef.current = false;
      return;
    }

    syncRef.current = true;
    cascadeForm.reset(buildStateFromLocation(selectedLocation));
    setPostcodeFirstMode(
      Boolean(
        selectedLocation?.postcode &&
        !selectedLocation?.country &&
        !selectedLocation?.state &&
        !selectedLocation?.city,
      ),
    );
    queueMicrotask(() => {
      syncRef.current = false;
    });
  }, [cascadeForm, selectedLocation]);

  useEffect(() => {
    if (syncRef.current) return;

    setPostcodeFirstMode(false);
    clearFields(["state", "city", "postcode", "postName"]);
  }, [clearFields, countryValue]);

  useEffect(() => {
    if (syncRef.current) return;

    setPostcodeFirstMode(false);
    clearFields(["city", "postcode", "postName"]);
  }, [clearFields, stateValue]);

  useEffect(() => {
    if (syncRef.current) return;

    setPostcodeFirstMode(false);
    clearFields(["postcode", "postName"]);
  }, [cityValue, clearFields]);

  useEffect(() => {
    if (syncRef.current) return;

    const isPostcodeFirst = Boolean(
      postcodeValue && !countryValue && !stateValue && !cityValue,
    );
    setPostcodeFirstMode(isPostcodeFirst);
    clearFields(["postName"]);
  }, [cityValue, clearFields, countryValue, postcodeValue, stateValue]);

  useEffect(() => {
    if (syncRef.current) return;

    const location = postName?.id ? (postName as Location) : null;
    if (!location) {
      clearSelectedLocation();
      return;
    }

    syncRef.current = true;
    cascadeForm.reset(buildStateFromLocation(location));
    queueMicrotask(() => {
      syncRef.current = false;
    });
    skipNextExternalSyncRef.current = true;
    form.setValue(name, location as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [cascadeForm, form, name, postName]);

  const countryQuery = useInfiniteLocationOptionsList(
    {
      field: "country",
      search: countrySearch || undefined,
    },
    20,
  );
  const stateQuery = useInfiniteLocationOptionsList(
    {
      field: "state",
      search: stateSearch || undefined,
      country: countryValue || undefined,
    },
    20,
    Boolean(countryValue),
  );
  const cityQuery = useInfiniteLocationOptionsList(
    {
      field: "city",
      search: citySearch || undefined,
      country: countryValue || undefined,
      state: stateValue || undefined,
    },
    20,
    Boolean(stateValue),
  );
  const postcodeQuery = useInfiniteLocationOptionsList(
    {
      field: "postcode",
      search: postcodeSearch || undefined,
      country: postcodeFirstMode ? undefined : countryValue || undefined,
      state: postcodeFirstMode ? undefined : stateValue || undefined,
      city: postcodeFirstMode ? undefined : cityValue || undefined,
    },
    20,
  );
  const postNameQuery = useInfiniteLocationOptionsList(
    {
      field: "postName",
      search: postNameSearch || undefined,
      country: countryValue || undefined,
      state: stateValue || undefined,
      city: cityValue || undefined,
      postcode: postcodeValue || undefined,
    },
    20,
    Boolean(postcodeValue),
  );

  return (
    <>
      <FormInfiniteSelect<
        LocationOption,
        PaginatedResponse<LocationOption>,
        string,
        LocationCascadeState
      >
        control={cascadeForm.control}
        label="Country"
        name="country"
        query={countryQuery}
        getItems={(p) => p?.data}
        valueKey={(i) => getLocationValue(i, "country")}
        labelKey={(i) => getLocationValue(i, "country")}
        placeholder="Country"
        searchValue={countrySearch}
        onSearchChange={setCountrySearch}
        required={required}
        disabled={postcodeFirstMode}
      />
      <FormInfiniteSelect<
        LocationOption,
        PaginatedResponse<LocationOption>,
        string,
        LocationCascadeState
      >
        control={cascadeForm.control}
        label="State"
        name="state"
        query={stateQuery}
        getItems={(p) => p?.data}
        valueKey={(i) => getLocationValue(i, "state")}
        labelKey={(i) => getLocationValue(i, "state")}
        placeholder="State"
        searchValue={stateSearch}
        onSearchChange={setStateSearch}
        required={required}
        disabled={!countryValue}
      />
      <FormInfiniteSelect<
        LocationOption,
        PaginatedResponse<LocationOption>,
        string,
        LocationCascadeState
      >
        control={cascadeForm.control}
        label="City"
        name="city"
        query={cityQuery}
        getItems={(p) => p?.data}
        valueKey={(i) => getLocationValue(i, "city")}
        labelKey={(i) => getLocationValue(i, "city")}
        placeholder="City"
        searchValue={citySearch}
        onSearchChange={setCitySearch}
        required={required}
        disabled={!stateValue}
      />
      <FormInfiniteSelect<
        LocationOption,
        PaginatedResponse<LocationOption>,
        string,
        LocationCascadeState
      >
        control={cascadeForm.control}
        label="Pincode"
        name="postcode"
        query={postcodeQuery}
        getItems={(p) => p?.data}
        valueKey={(i) => getLocationValue(i, "postcode")}
        labelKey={(i) => getLocationValue(i, "postcode")}
        placeholder="Pincode"
        searchValue={postcodeSearch}
        onSearchChange={setPostcodeSearch}
        required={required}
        disabled={Boolean(countryValue) && !cityValue}
      />
      <FormInfiniteSelect<
        LocationOption,
        PaginatedResponse<LocationOption>,
        string,
        LocationCascadeState
      >
        control={cascadeForm.control}
        label="Post Name"
        name="postName"
        query={postNameQuery}
        getItems={(p) => p?.data}
        valueKey={(i) => String(i?.id ?? getLocationValue(i, "postName"))}
        labelKey={(i) => getLocationValue(i, "postName")}
        placeholder="Post Name"
        searchValue={postNameSearch}
        onSearchChange={setPostNameSearch}
        required={required}
        disabled={!postcodeValue}
      />
    </>
  );
};

export default LocationCascadeFields;
