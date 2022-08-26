export default async function fetchApi(endpoint, options = {}) {
  const { method, body } = options;
  const _options =
    !method || method.toLowerCase() === get
      ? {}
      : {
        method,
        body: JSON.stringify(body),
      };
  const res = await fetch("/api/" + endpoint, { ..._options });
  return await res.json();
}
