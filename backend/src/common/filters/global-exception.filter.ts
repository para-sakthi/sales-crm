import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

type ErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const body: ErrorResponse = {
        error: {
          code: HttpStatus[status] ?? 'ERROR',
          message: exception.message,
          details: this.extractValidationDetails(exceptionResponse),
        },
      };

      reply.status(status).send(body);
      return;
    }

    this.logger.error(
      `Unhandled exception on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    reply.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  }

  private extractValidationDetails(
    response: string | object,
  ): Record<string, string[]> | undefined {
    if (
      typeof response === 'object' &&
      'message' in response &&
      Array.isArray(response.message)
    ) {
      return { validation: response.message as string[] };
    }
    return undefined;
  }
}
