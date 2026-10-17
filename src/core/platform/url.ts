// Query parameters may sit before the hash (index.html?mock=1#/) or inside it (#/tools?mock=1).

export function getParams(): URLSearchParams {
  const params = new URLSearchParams(window.location.search);
  const hashQuery = window.location.hash.split('?')[1];
  if (hashQuery) new URLSearchParams(hashQuery).forEach((value, key) => params.set(key, value));
  return params;
}

export function getParam(name: string): string | null {
  return getParams().get(name);
}

export function hasParam(name: string): boolean {
  const value = getParam(name);
  return value !== null && value !== '0' && value !== 'false';
}
