import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/',
  headers: { 'Content-Type': 'application/json' },
  // Increased timeout for longer AI calls (2 minutes)
  timeout: 120000,
});

api.interceptors.response.use(
  res => res,
  err => {
    // --- NEW: Handle 401 Unauthorized globally ---
    if (err.response && err.response.status === 401) {
      // This means the token is invalid or expired.
      // We can trigger a logout event or redirect here.
      localStorage.removeItem('user_data');
      // Reloading the page will force the AuthContext to re-evaluate
      // and redirect to the login page.
      window.location.href = '/login'; 
    }
    // Normalize error messages for UI consumers
    const serverError = err?.response?.data?.error || err?.response?.data || null
    const timedOut = err?.code === 'ECONNABORTED' || (err?.message && /timeout/i.test(err.message))
    const message = serverError || (timedOut ? 'Request timed out' : err?.message) || 'API Error'
    console.error('API Error:', serverError || err.message || err)
    // attach a normalized message property so callers can use it
    err.normalizedMessage = message
    return Promise.reject(err)
  }
)

export default api;
