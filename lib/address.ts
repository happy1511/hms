export type AddressLike = {
  type?: string | null;
  addressLineOne?: string | null;
  addressLineTwo?: string | null;
  addressLineThree?: string | null;
  location?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postcode?: string | null;
    postName?: string | null;
  } | null;
} | null;

export const formatAddress = (address?: AddressLike) => {
  if (!address) return "";

  return [
    address.addressLineOne,
    address.addressLineTwo,
    address.addressLineThree,
    address.location?.city,
    address.location?.state,
    address.location?.country,
    address.location?.postcode,
    address.location?.postName,
  ]
    .filter(Boolean)
    .join(", ");
};

export const formatPatientAddress = (patient?: {
  addresses?: AddressLike[];
}) => {
  const addresses = patient?.addresses?.filter(Boolean) ?? [];
  const address =
    addresses.find((item) => item?.type === "HOME") ?? addresses[0];

  return formatAddress(address);
};
