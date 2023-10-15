export const encode = (data: any): string => {
    return btoa(JSON.stringify(data))
  }
  
  export function decode<T>(data: string): T {
    return JSON.parse(atob(data))
  }