import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'auth-token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const publicUrls = ['/api/auth/login', '/api/auth/register', '/api/home/home'];

    if (publicUrls.some((url) => req.url.includes(url))) {
        return next(req); // Skip interception for public URLs
      }

  const token = window.sessionStorage.getItem(TOKEN_KEY);
  const clonedReq = req.clone({
    setHeaders:{
      Authorization: `Bearer ${token}`
    }
  })
  return next(clonedReq);
};