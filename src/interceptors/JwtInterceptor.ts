import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.auth.getIdToken()).pipe(
      switchMap((token) => {
        if (token == null) {
          const headers = request.headers.append('HTTP_REFERER', location.href);
          const requestClone = request.clone({
            headers,
          });
          return next.handle(requestClone);
        } else {
          const headers = request.headers
            .append('Authorization', 'Bearer ' + token)
            .append('X-Referer', location.href)
            .append('X-Host', location.origin);
          const requestClone = request.clone({
            headers,
          });
          return next.handle(requestClone);
        }
      })
    );
  }
}
