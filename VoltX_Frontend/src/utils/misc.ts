export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const getRandomId = (): string =>
  Math.random().toString(36).substr(2, 9);