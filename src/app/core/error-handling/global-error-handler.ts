import { Injectable, ErrorHandler } from "@angular/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    console.error('An error occurred:', error);
  }
}