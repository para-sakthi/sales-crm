import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type SingleResponse<T> = { data: T };

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  SingleResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SingleResponse<T>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
