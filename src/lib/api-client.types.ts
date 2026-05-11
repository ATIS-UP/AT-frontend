export interface ApiError {
  message: string;
  error_code: string;
  status_code: number;
  details?: Record<string, string[]>;
  timestamp: string;
}
