type UserNameFields = {
  firstName: string;
  middleName?: string | null;
  lastName: string;
};

export const trimOptionalString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const buildUserName = ({
  firstName,
  middleName,
  lastName,
}: UserNameFields) =>
  [firstName.trim(), middleName?.trim(), lastName.trim()]
    .filter(Boolean)
    .join(" ");
