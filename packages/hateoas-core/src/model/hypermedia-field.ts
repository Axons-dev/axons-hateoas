export interface HypermediaFieldOption {
  value: unknown;
  title?: string;
}

export interface HypermediaField {
  name: string;
  type?: string;
  title?: string;
  value?: unknown;
  required?: boolean;
  options?: HypermediaFieldOption[];
}
