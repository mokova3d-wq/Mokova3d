import { DatabaseSync } from "node:sqlite";

export interface SeedPage {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content_html: string;
}

export const SEED_PAGES: SeedPage[] = [
  {
    slug: "about",
    title: "About Mokova3D Studio",
    category: "Company",
    summary: "Pioneering bespoke 3D printing, engineered precision, and accessible design in Delhi & NCR.",
    content_html: `
      <h2>1. The Mokova3D Vision</h2>
      <p>Mokova3D was founded in Delhi NCR with a singular mission: to make modern, high-precision additive manufacturing accessible, transparent, and delight-driven. From small desk companions that bring daily joy to intricate architectural shadow lamps and industrial functional prototypes, we transform digital CAD concepts into durable physical objects.</p>

      <h2>2. What Makes Our Studio Different</h2>
      <ul>
        <li><strong>Physical Craftsmanship:</strong> We do not treat 3D printing as an automated factory conveyor. Every print is individually inspected for bed adhesion, tuned layer height resolution (0.12mm to 0.16mm), and manual post-processing finishing.</li>
        <li><strong>Material Integrity:</strong> We print exclusively in premium non-toxic bio-PLA, tough PETG, engineering ABS, and high-detail resin. Our primary filaments are biodegradable and safe for living spaces.</li>
        <li><strong>Bilateral Price Transparency:</strong> We believe high-craft additive manufacturing should never carry opaque retail markups. Our negotiation desk empowers buyers to propose batch and project prices directly.</li>
      </ul>

      <h2>3. Studio Location & Service Area</h2>
      <p>Operating directly out of Delhi NCR, we provide same-day or next-day courier delivery across New Delhi, Gurgaon, Noida, Faridabad, and Ghaziabad, alongside insured, tracked shipping across all states in India.</p>
    `
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    category: "Legal & Compliance",
    summary: "Governed by the Indian Contract Act, 1872, the Information Technology Act, 2000, and the Consumer Protection (E-Commerce) Rules, 2020.",
    content_html: `
      <div class="notice-box">
        <strong>LEGAL ADVISORY NOTICE:</strong> These Terms constitute a binding legal agreement between Mokova3D ("Company", "We", "Us") and the user ("Customer", "Buyer", "You"). Flagged for final review by qualified Indian legal counsel prior to formal corporate filing.
      </div>

      <h2>1. Contract Formation & Digital Acceptance</h2>
      <p>By browsing, requesting price quotes, making offers, or purchasing 3D printed items from Mokova3D, you agree to be bound by these Terms and Conditions pursuant to Section 10A of the Information Technology Act, 2000 (validity of contracts formed through electronic means) and the Indian Contract Act, 1872.</p>

      <h2>2. Nature of Services & Additive Manufacturing</h2>
      <p>Mokova3D provides on-demand 3D printing, rapid prototyping, and finished decorative items. Because additive manufacturing involves physical layer-by-layer deposition, slight microscopic layer lines and natural surface textures are normal characteristics of the manufacturing process and do not constitute defective merchandise.</p>

      <h2>3. Pricing, Offers & Payment Terms</h2>
      <ul>
        <li>All prices displayed on the storefront are in Indian Rupees (INR) and include applicable taxes unless specifically stated otherwise.</li>
        <li><strong>Price Discovery & Counter-Offers:</strong> Submitting a counter-offer or quote request does not constitute a completed sale. A binding purchase agreement is formed only when Mokova3D confirms the offer and payment is received via authorized UPI, bank transfer, or payment gateway.</li>
        <li>Quotes provided on WhatsApp or on-site remain valid for 7 calendar days from issuance.</li>
      </ul>

      <h2>4. Custom On-Demand Manufacturing Terms</h2>
      <p>Orders manufactured to custom dimensions, personalized designs, or customer-supplied CAD files (.STL, .OBJ) are non-cancellable once the slicing and physical printing cycle has commenced on the build bed.</p>

      <h2>5. Limitation of Liability</h2>
      <p>To the maximum extent permitted under applicable Indian law, Mokova3D's aggregate liability for any claim arising out of an order shall not exceed the total purchase price actually paid by the Customer for that specific item. In no event shall Mokova3D be liable for indirect, incidental, or consequential damages.</p>

      <h2>6. Governing Law & Dispute Resolution</h2>
      <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes, claims, or controversies shall be subject to the exclusive jurisdiction of the competent courts situated in <strong>New Delhi, India</strong>.</p>
    `
  },
  {
    slug: "privacy",
    title: "Privacy & Personal Data Protection Policy",
    category: "Legal & Compliance",
    summary: "Formulated in strict adherence to India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology (Reasonable Security Practices) Rules, 2011.",
    content_html: `
      <h2>1. Commitment to Data Protection</h2>
      <p>Mokova3D respects your fundamental right to privacy. This Policy outlines how we collect, process, store, and safeguard personal data in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and Rule 4 of the Information Technology Rules, 2011.</p>

      <h2>2. Categories of Personal Data Collected</h2>
      <ul>
        <li><strong>Identity & Contact Data:</strong> Full name, phone number, WhatsApp identifier, email address, and delivery shipping address in Delhi NCR or India.</li>
        <li><strong>Commercial & Transaction Data:</strong> Proposed offer prices, ordered quantities, quotation notes, and UPI/bank payment confirmation references. We do not store banking passwords or credit card CVV codes.</li>
        <li><strong>Uploaded CAD / Reference Files:</strong> STL, OBJ, or image reference files shared for custom print execution. Files remain confidential and are never sold or open-sourced.</li>
        <li><strong>Technical & Session Data:</strong> Local browser storage preferences (recently inspected models, theme settings).</li>
      </ul>

      <h2>3. Lawful Grounds for Processing</h2>
      <p>We process your personal data solely for legitimate uses: fulfilling 3D printing orders, dispatching local courier parcels, replying to WhatsApp price inquiries, issuing tax invoices, and complying with statutory obligations under Indian tax and commercial laws.</p>

      <h2>4. Your Rights as a Data Principal</h2>
      <p>Under the DPDP Act, 2023, you have the right to:</p>
      <ul>
        <li>Request access to a summary of personal data held by us.</li>
        <li>Request correction of inaccurate or incomplete contact information.</li>
        <li>Request erasure of your personal data when order fulfillment is complete, subject to mandatory statutory tax retention requirements.</li>
        <li>Nominate an individual or withdraw consent for non-essential communications.</li>
      </ul>

      <h2>5. Data Security & Grievance Contact</h2>
      <p>We maintain appropriate physical, electronic, and procedural safeguards. For any privacy requests, contact our designated Grievance Officer at <strong>privacy@mokova3d.com</strong> or WhatsApp +91 8527373680.</p>
    `
  },
  {
    slug: "returns",
    title: "Refund, Cancellation & Returns Policy",
    category: "Customer Policies",
    summary: "Compliant with the Consumer Protection (E-Commerce) Rules, 2020 and Rule 7 consumer safeguards.",
    content_html: `
      <h2>1. Statutory E-Commerce Compliance</h2>
      <p>Under the Consumer Protection (E-Commerce) Rules, 2020, Mokova3D maintains a transparent, time-bound refund and return framework for all consumer purchases.</p>

      <h2>2. Categorization of Purchases</h2>
      <p>Our catalog comprises two distinct product categories with tailored return conditions:</p>
      <ul>
        <li><strong>Standard Catalog Pieces (e.g., Cat, Penguin, Standard Lamps):</strong> Eligible for return or exchange within 7 days of delivery if unused, in original studio packaging, and in resaleable condition.</li>
        <li><strong>Custom On-Demand & Personalized Prints:</strong> Items manufactured specifically to customer-specified dimensions, personalized names, or user-supplied STL/OBJ files are exempt from arbitrary remorse return, except where defective or damaged in transit.</li>
      </ul>

      <h2>3. Transit Damage & Manufacturing Defect Claims</h2>
      <p>If your 3D print arrives broken, crushed by the courier, or exhibiting structural failure:</p>
      <ul>
        <li>Notify our studio within <strong>48 hours of delivery</strong> by sending photos or unboxing video to our WhatsApp hotline (+91 8527373680).</li>
        <li>Upon verified inspection, you may select: (a) <strong>Free Immediate Reprint</strong> with express courier priority, OR (b) <strong>100% Full Refund</strong>.</li>
      </ul>

      <h2>4. Order Cancellation Timeline</h2>
      <p>You may cancel any standard or custom order before physical printing has commenced on the build bed for a full 100% refund. Once machine slicing is finished and filament extrusion has begun, cancellation is subject to a 20% material preparation deduction.</p>

      <h2>5. Refund Processing Timelines</h2>
      <p>Approved refunds are processed within <strong>5 to 7 business days</strong> directly to the original payment source (UPI, Net Banking, or card) as mandated under RBI and Consumer Protection guidelines.</p>
    `
  },
  {
    slug: "shipping",
    title: "Shipping & Delivery Policy",
    category: "Customer Policies",
    summary: "Fulfillment schedules, courier handling, transit insurance, and delivery coverage across Delhi NCR and India.",
    content_html: `
      <h2>1. Delivery Coverage Area</h2>
      <p>Mokova3D operates from Delhi NCR and fulfills deliveries across two tiers:</p>
      <ul>
        <li><strong>Tier 1 ? Local Delhi & NCR:</strong> Delhi, Gurgaon, Noida, Greater Noida, Ghaziabad, and Faridabad. Standard delivery takes <strong>1 to 3 business days</strong> via express local couriers.</li>
        <li><strong>Tier 2 ? Pan-India:</strong> All serviceable pin-codes across Indian States and Union Territories. Delivery takes <strong>3 to 6 business days</strong> via tracked national logistics partners (BlueDart, Delhivery, Speed Post).</li>
      </ul>

      <h2>2. Studio Print Times & Lead Schedules</h2>
      <p>Most ready designs are sliced and printed within 24 to 48 hours. Custom multi-part models or large-volume batch orders require an agreed production lead time confirmed before payment.</p>

      <h2>3. Protective Transit Packaging</h2>
      <p>3D printed items are fragile during extreme courier handling. Every Mokova3D piece is cocooned in multi-layer shock-absorbing air cushions and durable corrugated outer boxes with tamper-evident sealing.</p>

      <h2>4. Tracking & Courier Communication</h2>
      <p>As soon as your parcel is dispatched, tracking details and direct AWB links are shared with you via WhatsApp and SMS.</p>
    `
  },
  {
    slug: "cookies",
    title: "Cookie & Local Storage Policy",
    category: "Legal & Compliance",
    summary: "Transparent disclosure regarding browser storage, essential functional cookies, and privacy controls.",
    content_html: `
      <h2>1. Use of Cookies and Browser Storage</h2>
      <p>Mokova3D uses cookies and modern browser localStorage strictly to provide essential site functionality and a responsive user experience.</p>

      <h2>2. Types of Storage Employed</h2>
      <ul>
        <li><strong>Essential Session Cookies:</strong> Required to maintain administrator login sessions and protect against Cross-Site Request Forgery (CSRF).</li>
        <li><strong>Functional LocalStorage:</strong> Used to temporarily remember your recently inspected 3D models and theme settings so you do not lose context when returning to the site. This data stays on your device and is never uploaded to third-party ad networks.</li>
        <li><strong>Analytics Cookies:</strong> Aggregated, non-identifying telemetry used exclusively to monitor website performance and server latency.</li>
      </ul>

      <h2>3. Managing Cookie Preferences</h2>
      <p>You can clear or block cookies at any time via your browser settings (Chrome, Safari, Firefox, Edge). Blocking essential cookies will restrict administrative login functionality.</p>
    `
  },
  {
    slug: "buyer-seller-terms",
    title: "Buyer & Seller Marketplace Terms",
    category: "Commercial & Marketplace",
    summary: "Commercial rules governing custom price discovery, formal quotations, seller SLA, and escrow terms.",
    content_html: `
      <h2>1. Bilateral Negotiation Protocol</h2>
      <p>Mokova3D facilitates transparent bilateral price negotiation for complex 3D printed items and batch orders.</p>
      <ul>
        <li><strong>Counter-Offers:</strong> A counter-offer submitted by a buyer represents a commercial proposal. Offers below the minimum floor threshold trigger review against volume terms and machine time.</li>
        <li><strong>Quotation Validity:</strong> Formal proposals issued by Mokova3D remain locked and guaranteed for 7 calendar days.</li>
        <li><strong>Binding Confirmation:</strong> Mutual consent is confirmed when the buyer accepts the final quote and pays the initial deposit or full amount.</li>
      </ul>

      <h2>2. Dimensional & Material Tolerances</h2>
      <p>Sellers and studio engineers commit to maintaining dimensional accuracy within ?0.15mm for FDM printing and ?0.05mm for SLA resin printing. Buyers requiring aerospace or surgical tolerances must specify explicit requirements during the quotation stage.</p>
    `
  },
  {
    slug: "ip-policy",
    title: "Intellectual Property & Copyright Policy",
    category: "Legal & Compliance",
    summary: "Enforced under the Indian Copyright Act, 1957, Patents Act, 1970, and Designs Act, 2000.",
    content_html: `
      <h2>1. Proprietary Mokova3D Assets</h2>
      <p>All brand assets, original sculpted digital models, catalog photography, text, and website architecture are the exclusive intellectual property of Mokova3D and are protected under the Copyright Act, 1957.</p>

      <h2>2. Customer-Supplied CAD Models & Warranties</h2>
      <p>When you provide a 3D model (.STL, .OBJ) or reference sketch for custom printing, you represent and warrant that:</p>
      <ul>
        <li>You hold full ownership, valid copyright license, or authorization to reproduce the design.</li>
        <li>The requested print does not infringe any third-party patent, trademark, industrial design, or trade secret.</li>
        <li>You grant Mokova3D a limited, non-exclusive license solely for the purpose of physically manufacturing the requested items.</li>
      </ul>

      <h2>3. Notice and Takedown Procedure</h2>
      <p>If you believe any content or design displayed on Mokova3D infringes your copyright or trademark, submit a formal written notice with supporting proof of ownership to our designated IP Officer at <strong>ip@mokova3d.com</strong>.</p>
    `
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use & Prohibited Prints Policy",
    category: "Legal & Compliance",
    summary: "Strict safety guidelines prohibiting illegal, hazardous, or weapon-related additive manufacturing under Indian Penal Code and Arms Act.",
    content_html: `
      <h2>1. Zero-Tolerance Safety Protocol</h2>
      <p>Mokova3D enforces an absolute, non-negotiable ban on printing hazardous, illegal, or harmful physical objects. Under the Indian Arms Act, 1959 and the Bharatiya Nyaya Sanhita, 2023, we refuse and immediately cancel any order containing:</p>
      <ul>
        <li>Firearms, weapon components, firing mechanisms, silencers, or gun frames.</li>
        <li>Knives, blades, brass knuckles, or offensive physical weapons.</li>
        <li>Lock-picking tools, key duplication from unauthorized scans, or burglary implements.</li>
        <li>Counterfeit currency dies, unauthorized government seals, or official emblems.</li>
        <li>Obscene, hateful, or defamatory physical caricatures violating Indian public order laws.</li>
      </ul>

      <h2>2. Refusal of Service</h2>
      <p>Our print engineering team reviews all incoming files. Any violation will lead to immediate cancellation, forfeiture of print preparation fees, and reporting to relevant Indian law enforcement authorities where legally mandated.</p>
    `
  },
  {
    slug: "grievance",
    title: "Grievance Redressal & Statutory Compliance",
    category: "Legal & Compliance",
    summary: "Mandatory statutory disclosure under Rule 5(9) of Consumer Protection (E-Commerce) Rules, 2020 and Rule 3(2) of Information Technology Intermediary Rules, 2021.",
    content_html: `
      <div class="notice-box">
        <strong>STATUTORY DISCLOSURE (CONSUMER PROTECTION RULES 2020):</strong> In compliance with the Consumer Protection (E-Commerce) Rules, 2020 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the details of the designated Grievance Redressal Officer are published below.
      </div>

      <h2>1. Designated Grievance Officer Details</h2>
      <table class="legal-table">
        <tr>
          <td><strong>Grievance Officer Name:</strong></td>
          <td>[Designated Grievance Officer - Mokova3D]</td>
        </tr>
        <tr>
          <td><strong>Designation:</strong></td>
          <td>Head of Legal & Customer Compliance</td>
        </tr>
        <tr>
          <td><strong>Official Grievance Email:</strong></td>
          <td>grievance@mokova3d.com</td>
        </tr>
        <tr>
          <td><strong>Compliance Hotline:</strong></td>
          <td>+91 8527373680 (Mon?Fri, 10:00 AM to 6:00 PM IST)</td>
        </tr>
        <tr>
          <td><strong>Registered Physical Studio:</strong></td>
          <td>Mokova3D Studio, Delhi & NCR, India [Full Registered Postal Address to be finalized by Company]</td>
        </tr>
      </table>

      <h2>2. Redressal Mechanism & Statutory Timelines</h2>
      <ul>
        <li><strong>Acknowledgment:</strong> Every formal consumer grievance received via email or physical postal notice shall be acknowledged with a unique tracking ticket within <strong>48 hours</strong> of receipt.</li>
        <li><strong>Investigation & Redressal:</strong> All consumer grievances shall be investigated and redressed within <strong>30 calendar days</strong> from the date of receipt, as mandated under Rule 5(9) of the E-Commerce Rules.</li>
      </ul>

      <h2>3. National Consumer Helpline (NCH)</h2>
      <p>Consumers who are not satisfied with initial dispute resolution may also approach the National Consumer Helpline (NCH) via toll-free number 1915 or portal <em>consumerhelpline.gov.in</em>.</p>
    `
  }
];

export function seedLegalPages(db: DatabaseSync) {
  const count = (db.prepare("SELECT count(*) as count FROM pages").get() as any)?.count || 0;
  if (count === 0) {
    const insPage = db.prepare(`
      INSERT OR REPLACE INTO pages (slug, title, category, summary, content_html, published, last_updated, version, legal_review_flagged)
      VALUES (?, ?, ?, ?, ?, 1, datetime('now'), 1, 1)
    `);

    const insRev = db.prepare(`
      INSERT OR REPLACE INTO page_revisions (id, page_slug, version, title, content_html, author, created_at, note)
      VALUES (?, ?, 1, ?, ?, 'system_seed', datetime('now'), 'Initial statutory and informational seed')
    `);

    for (const p of SEED_PAGES) {
      insPage.run(p.slug, p.title, p.category, p.summary, p.content_html);
      insRev.run(`rev-${p.slug}-v1`, p.slug, p.title, p.content_html);
    }
  }
}
