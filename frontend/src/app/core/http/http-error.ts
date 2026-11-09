/**
 * Error normalizado que lanzan las llamadas HTTP. Los componentes muestran
 * directamente `.message`, que viene del campo `error` que devuelve el
 * GlobalExceptionHandler del backend ({ status, error }).
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
