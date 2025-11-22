export interface TSuccessResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}
