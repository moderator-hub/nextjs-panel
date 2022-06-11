export function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === ""
}

export interface ModPerm {
  id: number
  name: string
}

export interface ModeratorData {
  id: Number
  permissions: ModPerm[]
  locale: string
  mode: string
}
