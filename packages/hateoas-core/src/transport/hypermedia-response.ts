export interface HypermediaResponse {
  status: number;
  contentType: string;
  headers: Record<string, string>;
  body: unknown;
}
