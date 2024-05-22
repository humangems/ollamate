export type Note = {
  id: string;
  content: string;
  title?: string;
  created_at?: number;
  updated_at?: number;
};

export type ImportedNote = {
  title?: string;
  content: string;
  created_at: number;
  updated_at: number;
}

export type Model = {
  name: string;
  model: string;
  size: number;
  digest: string;
  modified_at: string; //2023-11-04T14:56:49.277302595-07:00
};