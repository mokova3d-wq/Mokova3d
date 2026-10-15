/**
 * Google Sheets Integration Contract
 * Prepares the schema for requirement tracking and incoming lead registration (Phase 4).
 * Ensures rows can be mapped directly to Google Sheets columns without data loss.
 */

export type RequirementPriority = "P0_CRITICAL" | "P1_HIGH" | "P2_MEDIUM" | "P3_LOW";
export type RequirementStatus = "DRAFT" | "PROPOSED" | "APPROVED" | "IN_PROGRESS" | "VERIFIED" | "DEFERRED";

export interface RequirementRegisterItem {
  reqId: string;
  category: "ARCHITECTURE" | "3D_EXPERIENCE" | "NEGOTIATION" | "INTEGRATION" | "SECURITY" | "DESIGN";
  title: string;
  description: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  acceptanceCriteria: string[];
  ownerRole: string;
  targetPhase: number;
  lastUpdatedUtc: string;
  changeNotes?: string;
}

export interface InquiryLeadRow {
  inquiryId: string;
  timestamp: string;
  type: "QUOTE" | "OFFER";
  productId: string;
  productName: string;
  proposedPriceUsd?: number;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  buyerCompany?: string;
  status: "NEW" | "IN_REVIEW" | "COUNTERED" | "ACCEPTED" | "DECLINED";
}

export interface ISheetsSyncAdapter {
  syncRequirements(items: RequirementRegisterItem[]): Promise<{ syncedCount: number; timestamp: string }>;
  recordInquiryLead(lead: InquiryLeadRow): Promise<{ rowId: string; status: "RECORDED" }>;
}
