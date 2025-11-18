export interface ApiResponse<T> {
  erc: number
  msg: string
  data: T
}