export function isEmpty(value: any): boolean {
  return value === undefined || value === null || value === ""
}

export interface ModPerm {
  id: number
  name: string
}
