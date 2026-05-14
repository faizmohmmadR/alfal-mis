export interface Unit {
  id: number;
  name: string;
  symbol: string;
  description?: string;
  company?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitData {
  name: string;
  symbol: string;
  description?: string;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}