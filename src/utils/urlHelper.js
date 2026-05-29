export const getAvatarUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const baseUrl = (
    process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_SERVER_BASE_URL ||
    'http://localhost:8000/api'
  ).replace(/\/+$/, '').replace(/\/api$/, '');
  
  // Normalize path (ensure leading slash)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
};
