/**
 * Email Workflow Integration Contract
 * Prepares the application for future email workflows (Phase 4),
 * ensuring strictly typed payloads, zero hardcoded credentials, and decoupled adapters.
 */

export type EmailWorkflowType =
  | "PRICE_QUOTE_REQUEST"
  | "BUYER_COUNTER_OFFER"
  | "SELLER_COUNTER_PROPOSAL"
  | "DEAL_ACCEPTED_CONFIRMATION";

export interface BuyerContactInfo {
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  country: string;
}

export interface PriceQuoteRequestPayload {
  workflowType: "PRICE_QUOTE_REQUEST";
  productId: string;
  productName: string;
  productSku: string;
  quantityRequested: number;
  buyer: BuyerContactInfo;
  customRequirementsNotes?: string;
  timestampUtc: string;
}

export interface BuyerCounterOfferPayload {
  workflowType: "BUYER_COUNTER_OFFER";
  productId: string;
  productName: string;
  productSku: string;
  referencePriceUsd: number;
  proposedPriceUsd: number;
  variancePercentage: number;
  quantity: number;
  buyer: BuyerContactInfo;
  hagglingRationale: string;
  validUntilUtc: string;
  timestampUtc: string;
}

export type NegotiationEmailPayload = PriceQuoteRequestPayload | BuyerCounterOfferPayload;

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  dispatchedAt: string;
  error?: string;
}

/**
 * Service boundary interface for email notifications.
 * In Phase 1, implemented as an in-memory or validated mock adapter.
 */
export interface IEmailNotificationService {
  dispatchQuoteRequest(payload: PriceQuoteRequestPayload): Promise<EmailDispatchResult>;
  dispatchCounterOffer(payload: BuyerCounterOfferPayload): Promise<EmailDispatchResult>;
}
