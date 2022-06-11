export function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === ""
}

export interface InterfaceSettings {
  mode?: string
}

export interface ModPerm {
  id: number
  name: string
}

export interface ModeratorData extends InterfaceSettings {
  id: Number
  permissions: ModPerm[]
}
