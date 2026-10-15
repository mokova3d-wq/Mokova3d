import { NextResponse } from "next/server";
import { getInquiries, recordInquiry, updateInquiryStatus } from "@/lib/api-db";
import { isAuthorizedAdmin } from "@/lib/auth-check";
import { isFeatureEnabled, FEATURE_KEYS } from "@/lib/features";

// Rate limiting & duplicate-submission protection tracker
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const duplicateSubmissionMap = new Map<string, number>();

export async function GET(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = getInquiries();
  return NextResponse.json(inquiries);
}

export async function POST(req: Request) {
  try {
    // 1. IP-based rate limiting (10 requests per 5 minutes)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const now = Date.now();
    const rateData = rateLimitMap.get(ip);
    if (rateData && now < rateData.resetAt) {
      if (rateData.count >= 10) {
        return NextResponse.json(
          { error: "Too many quote requests. Please wait a few minutes before submitting again." },
          { status: 429 }
        );
      }
      rateData.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    }

    const body = await req.json();
    const buyerName = (body.buyer_name || body.buyer?.fullName || "").trim();
    const buyerPhone = (body.buyer_phone || body.buyer?.phone || body.buyer?.email || "").trim();
    const productName = (body.product_name || body.productName || "Custom 3D Print Request").trim();

    if (!buyerName || buyerName.length < 2) {
      return NextResponse.json(
        { error: "Please provide a valid client name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!buyerPhone || buyerPhone.length < 7) {
      return NextResponse.json(
        { error: "Please provide a valid contact phone number or email address." },
        { status: 400 }
      );
    }

    // 2. Duplicate submission prevention (blocks duplicate request within 45 seconds)
    const duplicateKey = `${buyerPhone.toLowerCase()}-${productName.toLowerCase()}`;
    const lastSub = duplicateSubmissionMap.get(duplicateKey);
    if (lastSub && now - lastSub < 45 * 1000) {
      return NextResponse.json(
        {
          error:
            "A duplicate quote request was recently received. Our studio team is already processing your initial submission.",
        },
        { status: 409 }
      );
    }
    duplicateSubmissionMap.set(duplicateKey, now);

    const isCustomPrint = body.type === "CUSTOM_PRINT" || body.workflowType === "CUSTOM_3D_PRINT";
    const type = isCustomPrint ? "CUSTOM_PRINT" : body.type || (body.workflowType === "BUYER_COUNTER_OFFER" ? "OFFER" : "QUOTE");

    if (type === "OFFER" && !isFeatureEnabled(FEATURE_KEYS.PRICE_NEGOTIATION)) {
      return NextResponse.json(
        { error: "Price negotiation is temporarily paused by the studio. Please enquire directly on WhatsApp." },
        { status: 403 }
      );
    }

    const refCode = `MKV-${isCustomPrint ? "PRINT" : "INQ"}-${Math.floor(10000 + Math.random() * 90000)}`;

    const inq = {
      id: refCode,
      type,
      product_id: body.product_id || body.productId || "",
      product_name: productName,
      proposed_price: body.proposed_price || body.proposedPriceUsd || 0,
      quantity: Math.max(1, parseInt(body.quantity, 10) || 1),
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      rationale: (body.rationale || body.hagglingRationale || body.customRequirementsNotes || "").slice(0, 1500),
      status: "NEW",
    };

    const id = recordInquiry(inq);

    // Clean old duplicate records
    for (const [k, timestamp] of duplicateSubmissionMap.entries()) {
      if (now - timestamp > 60 * 1000) duplicateSubmissionMap.delete(k);
    }

    return NextResponse.json({
      success: true,
      id,
      referenceCode: refCode,
      message: isCustomPrint
        ? "Custom 3D print request logged successfully. Studio engineering team will review your mesh and reply on WhatsApp within 1-2 hours."
        : "Inquiry recorded successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit request" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    updateInquiryStatus(id, status);
    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}