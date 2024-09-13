export class Result {
  data?: any;
  error?: any;

  constructor(data?: any, error?: any) {
    this.data = data;
    this.error = error;
  }
}

// Error class extending Result
export class Failure extends Result {
  constructor(error: any) {
    super(null, error);  // Only set the error field
  }
}

// Success class extending Result
export class Success extends Result {
  constructor(data: any) {
    super(data, undefined);  // Only set the data field
  }
}