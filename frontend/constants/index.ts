export const ROLES = {
  SEEKER: "SEEKER",
  EMPLOYER: "EMPLOYER",
} as const;

export type ROLE_TYPE = keyof typeof ROLES;
export type ROLE_ARRAY_TYPE = (typeof ROLES)[keyof typeof ROLES][];
