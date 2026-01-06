/**
 * Type declarations for @paypal/checkout-server-sdk
 * Since the package doesn't have official TypeScript types
 */

declare module '@paypal/checkout-server-sdk' {
  export class core {
    static SandboxEnvironment: typeof SandboxEnvironment;
    static LiveEnvironment: typeof LiveEnvironment;
    static PayPalHttpClient: typeof PayPalHttpClient;
  }

  export class SandboxEnvironment {
    constructor(clientId: string, clientSecret: string);
  }

  export class LiveEnvironment {
    constructor(clientId: string, clientSecret: string);
  }

  export class PayPalHttpClient {
    constructor(environment: SandboxEnvironment | LiveEnvironment);
    execute(request: any): Promise<any>;
  }

  export class orders {
    static OrdersCreateRequest: typeof OrdersCreateRequest;
    static OrdersCaptureRequest: typeof OrdersCaptureRequest;
    static OrdersGetRequest: typeof OrdersGetRequest;
  }

  export class OrdersCreateRequest {
    constructor();
    requestBody(body: any): void;
  }

  export class OrdersCaptureRequest {
    constructor(orderId: string);
  }

  export class OrdersGetRequest {
    constructor(orderId: string);
  }

  export class payments {
    static CapturesRefundRequest: typeof CapturesRefundRequest;
  }

  export class CapturesRefundRequest {
    constructor(captureId: string);
    requestBody(body: any): void;
  }
}
