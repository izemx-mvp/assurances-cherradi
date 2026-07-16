import type { Action, Resource, UserRole } from "./types";

const matrix: Record<UserRole, Record<Resource, Action[]>> = {
  admin: {
    prospects: ["create", "read", "update", "delete"],
    campaigns: ["create", "read", "update", "delete"],
    conversations: ["create", "read", "update", "delete"],
    commerciaux: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete"],
  },
  manager: {
    prospects: ["create", "read", "update", "delete"],
    campaigns: ["create", "read", "update", "delete"],
    conversations: ["read", "update"],
    commerciaux: ["create", "read", "update"],
    users: ["read"],
  },
  commercial: {
    prospects: ["read", "update"],
    campaigns: ["read"],
    conversations: ["read", "update"],
    commerciaux: ["read"],
    users: [],
  },
  viewer: {
    prospects: ["read"],
    campaigns: ["read"],
    conversations: ["read"],
    commerciaux: ["read"],
    users: [],
  },
};

export function can(role: UserRole, resource: Resource, action: Action): boolean {
  return matrix[role][resource].includes(action);
}

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrateur",
  manager: "Manager",
  commercial: "Commercial",
  viewer: "Lecteur",
};
