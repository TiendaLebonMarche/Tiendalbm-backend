import { AbstractPaymentProvider, PaymentSessionStatus } from "@medusajs/framework/utils"
import {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

export type EfectivoPaymentOptions = Record<string, never>

export class EfectivoPaymentService extends AbstractPaymentProvider<EfectivoPaymentOptions> {
  static identifier = "efectivo-payment"

  constructor(container: any, options?: EfectivoPaymentOptions) {
    super(container, options)
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    return {
      id: `efectivo_${Date.now()}`,
      data: {
        status: "pending",
        created_at: new Date().toISOString(),
      },
    }
  }

  async authorizePayment(
    _input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data: {
        status: "authorized",
        authorized_at: new Date().toISOString(),
      },
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return {
      data: {
        ...input.data,
        status: "captured",
        captured_at: new Date().toISOString(),
      },
    }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return {
      data: {
        ...input.data,
        status: "canceled",
        canceled_at: new Date().toISOString(),
      },
    }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return {
      data: input.data ?? {},
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const dataStatus = input.data?.status as string | undefined

    if (!dataStatus) {
      return { status: PaymentSessionStatus.PENDING }
    }

    switch (dataStatus) {
      case "captured":
        return { status: PaymentSessionStatus.CAPTURED }
      case "authorized":
        return { status: PaymentSessionStatus.AUTHORIZED }
      case "canceled":
        return { status: PaymentSessionStatus.CANCELED }
      default:
        return { status: PaymentSessionStatus.PENDING }
    }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    return {
      data: {
        ...input.data,
        status: "refunded",
        refunded_at: new Date().toISOString(),
      },
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return {
      data: input.data ?? {},
    }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    return {
      data: { ...(input.data ?? {}) },
    }
  }

  async getWebhookActionAndData(
    _data: { data: Record<string, unknown>; rawData: string | Buffer; headers: Record<string, unknown> }
  ): Promise<WebhookActionResult> {
    return {
      action: "default" as any,
      data: {
        session_id: "",
        amount: null,
      },
    }
  }
}

export default EfectivoPaymentService
