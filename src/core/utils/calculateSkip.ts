export const calculateSkip = (pageNumber: number, pageSize: number): number => {
  return (pageNumber - 1) * pageSize
}