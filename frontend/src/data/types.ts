// ── Shared enums / unions ──────────────────────────────────────────────

export type OemSegment =
  | 'Room AC'
  | 'Air Cooler'
  | 'Washing Machine'
  | 'Refrigerator'
  | 'Ceiling Fan'
  | 'Exhaust Fan'
  | 'Water Purifier'
  | 'Other'

export const OEM_SEGMENTS: OemSegment[] = [
  'Room AC',
  'Air Cooler',
  'Washing Machine',
  'Refrigerator',
  'Ceiling Fan',
  'Exhaust Fan',
  'Water Purifier',
  'Other',
]

export type Priority = 'A' | 'B' | 'C'
export type CustomerTier = 'Tier 1' | 'Tier 2' | 'Tier 3'
export type VendorStatus = 'Not Started' | 'In Progress' | 'Approved' | 'Rejected'

export type DealStage =
  | 'Lead - Hot'
  | 'Lead - Cold'
  | 'Discussion'
  | 'NDA'
  | 'Sample Submitted'
  | 'Testing'
  | 'Commercial Negotiation'
  | 'PFI Sent'
  | 'PO Received'
  | 'Closed Won'
  | 'Closed Lost'

export const DEAL_STAGES: DealStage[] = [
  'Lead - Hot',
  'Lead - Cold',
  'Discussion',
  'NDA',
  'Sample Submitted',
  'Testing',
  'Commercial Negotiation',
  'PFI Sent',
  'PO Received',
  'Closed Won',
  'Closed Lost',
]

/** Open stages shown on the pipeline board (closed stages handled separately). */
export const OPEN_STAGES: DealStage[] = DEAL_STAGES.filter(
  (s) => s !== 'Closed Won' && s !== 'Closed Lost',
)

export type Confidence = 0 | 25 | 50 | 75 | 100

export type Department =
  | 'R&D'
  | 'Purchase'
  | 'Vendor Development'
  | 'Quality'
  | 'Management'
  | 'Operations'
  | 'Finance'
  | 'Other'

export type BuyingRole = 'Decision Maker' | 'Influencer' | 'Gatekeeper' | 'User' | 'Champion'

export type MotorType =
  | 'BLDC Indoor'
  | 'BLDC Outdoor'
  | 'PSC'
  | 'Universal'
  | 'Direct Drive'
  | 'Stepper'
  | 'PMSM'
  | 'Other'

export type SensorType =
  | 'Hall'
  | 'Sensorless Back-EMF'
  | 'Encoder Optical'
  | 'Encoder Magnetic'
  | 'Resolver'

export type VisitType = 'In-Person' | 'Virtual' | 'Phone'
export type VisitPurpose =
  | 'Discovery'
  | 'Follow-up'
  | 'Sample Review'
  | 'Negotiation'
  | 'Plant Audit'
  | 'Relationship'
  | 'Other'
export type Sentiment = 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative'

export type DocType =
  | 'NDA (Mutual)'
  | 'NDA (One-way)'
  | 'Technical Spec Sheet'
  | 'Product Datasheet'
  | 'Vendor Registration Form'
  | 'BIS Certificate'
  | 'Test Report'
  | 'Brochure/Catalog'
  | 'Other'
export type DocDirection = 'Sent' | 'Received'
export type DocStatus = 'Draft' | 'Sent' | 'Signed' | 'Expired'

export type SampleStatus = 'Not Started' | 'In Progress' | 'Passed' | 'Failed' | 'Rework'
export type TestResult = 'Approved' | 'Rejected' | 'Conditional'
export type Severity = 'High' | 'Medium' | 'Low'

export type QuoteStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'
export type PaymentTerms =
  | '100% Advance'
  | '50% Advance, 50% on Delivery'
  | 'Net 30'
  | 'Net 45'
  | 'Net 60'
  | 'Net 90'
  | 'Letter of Credit (LC)'
  | 'Other'
export type DeliveryTerms = 'Ex-Works' | 'FOR Destination' | 'CIF' | 'FOB' | 'DAP' | 'Other'

export type ApprovalTier = 'Auto-approved' | 'Sales Manager' | 'VP / Director' | 'CEO'

export type PfiType = 'Trial Order' | 'Annual Contract' | 'Spot Order' | 'Rate Contract'
export type PfiStatus =
  | 'Draft'
  | 'Pending Rep'
  | 'Pending Commercial'
  | 'Pending Management'
  | 'Approved'
  | 'Rejected'
  | 'Revised'
export type GstRate = 0 | 5 | 12 | 18 | 28
export type UnitOfMeasure = 'Pcs' | 'Set' | 'Nos' | 'Kit'

export type PoOrderType =
  | 'Trial Order'
  | 'Mass Production'
  | 'Repeat Order'
  | 'Spot Order'
  | 'Rate Contract'

export type PoStatus =
  | 'Pending'
  | 'Validated'
  | 'Mismatch Flagged'
  | 'Accepted with Deviation'
  | 'Rejected'

export type TripApprovalStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected'

// ── Entities ──────────────────────────────────────────────────────────────────

export interface ActionItem {
  task: string
  owner: string
  deadline?: string
}

export interface ActivityLog {
  id: string
  date: string
  kind: 'note' | 'call' | 'email' | 'visit' | 'stage' | 'system'
  text: string
}

export type RevenueRange = '< 100 Cr' | '100–500 Cr' | '500–1000 Cr' | '1000–5000 Cr' | '> 5000 Cr'

export interface Customer {
  id: string
  companyName: string
  segment: OemSegment
  leadSource: string
  city: string
  billingState: string
  shippingState: string
  gstin: string
  website?: string
  priority: Priority
  tier: CustomerTier
  accountOwner: string
  vendorStatus: VendorStatus
  vendorCode?: string
  annualPotential: number
  plantLocations?: string
  // Expanded company profile (per requirements)
  revenueRange?: RevenueRange
  productionCapacity?: number
  registeredAddress?: string
  factoryAddress?: string
  regSubmittedDate?: string
  expectedApprovalDate?: string
  vendorRemarks?: string
  registrationDocsFileName?: string
  tags?: string[]
  notes?: string
  createdAt: string
}

export interface Contact {
  id: string
  customerId: string
  name: string
  designation: string
  department: Department
  mobile: string
  email: string
  officeLandline?: string
  buyingRole: BuyingRole
  reportsTo?: string
  isPrimary: boolean
  linkedin?: string
  birthday?: string
  anniversary?: string
  notes?: string
}

export interface Product {
  id: string
  sku: string
  modelName: string
  motorType: MotorType
  voltage: number
  wattage: number
  poles: number
  sensorType: SensorType
  hsnCode: string
  sellingPrice: number
  description?: string
  specSheetFileName?: string
  createdAt: string
}

export type LostReason =
  | 'Price'
  | 'Quality'
  | 'Lead Time'
  | 'Competition'
  | 'Budget'
  | 'Technical Fit'
  | 'Relationship'
  | 'Customer Internal Decision'
  | 'Other'

export type NegotiationOutcome = 'Ongoing' | 'Agreed' | 'Deadlocked' | 'Escalated'

export interface NegotiationRound {
  id: string
  round: number
  date: string
  ourPrice: number
  counterPrice: number
  concessionsOffered?: string
  concessionsReceived?: string
  outcome: NegotiationOutcome
  escalatedTo?: string
  note?: string
  finalAgreedPrice?: number
  finalAgreedPaymentTerms?: string
}

export interface Deal {
  id: string
  customerId: string
  contactId?: string
  segment: OemSegment
  productId: string
  quantity: number
  currentSupplier?: string
  currentSupplierPrice?: number
  quotedPrice: number
  confidence: Confidence
  stage: DealStage
  owner: string
  nextAction?: string
  nextActionDate?: string
  lostReason?: LostReason
  negotiations: NegotiationRound[]
  lastActivityAt: string
  createdAt: string
  log: ActivityLog[]
}

export interface Visit {
  id: string
  customerId: string
  dealId?: string
  date: string
  visitTime?: string
  type: VisitType
  purpose: VisitPurpose
  ourAttendees: string[]
  customerAttendees: string[]
  summary: string
  keyDecisions?: string
  actionItems?: ActionItem[]
  sentiment: Sentiment
  confidence?: Confidence
  competitor?: string
  nextVisitDate?: string
}

export interface DocumentRecord {
  id: string
  customerId: string
  dealId?: string
  type: DocType
  direction: DocDirection
  sentReceivedDate?: string
  status: DocStatus
  version: number
  validityDate?: string
  signedCopy: boolean
  fileName: string
  remarks?: string
  createdAt: string
}

export interface SampleIssue {
  description: string
  severity: Severity
}

export interface Sample {
  id: string // SAM-YYYY-XXXX
  customerId: string
  dealId: string
  productId: string
  quantitySent: number
  dispatchDate: string
  courier?: string
  tracking?: string
  delivered: boolean
  deliveryConfirmedDate?: string
  status: SampleStatus
  testStartDate?: string
  expectedCompletionDate?: string
  testTypes: string[]
  resultSummary?: string
  customerFeedback?: string
  issues: SampleIssue[]
  rndCoordinator?: string
  reworkDescription?: string
  resubmissionDate?: string
  finalResult?: TestResult
  version: number
  createdAt: string
}

export interface BomBuildUp {
  rawMaterial: number
  conversion: number
  consumables: number
  packaging: number
  freight: number
}

export interface Quote {
  id: string // QOT-YYYY-XXXX
  customerId: string
  dealId?: string
  productId: string
  quantity: number
  moq?: number
  bom: BomBuildUp
  targetMargin: number // %
  finalPrice: number
  marketLow: number
  marketHigh: number
  customerCurrentPrice?: number
  validityDays: number
  paymentTerms: PaymentTerms
  deliveryTerms: DeliveryTerms
  status: QuoteStatus
  createdAt: string
}

export interface PfiLineItem {
  productId: string
  hsnCode: string
  quantity: number
  uom?: UnitOfMeasure
  unitPrice: number
  discountPct: number
  gstRate: GstRate
  deliverySchedule?: string
}

export interface Pfi {
  id: string // PFI-YYYY-XXXX
  quoteId: string
  customerId: string
  pfiType?: PfiType
  pfiValidityDays?: number
  pfiPaymentTerms?: string
  pfiDeliveryTerms?: string
  deliveryTimeline?: string
  customerReference?: string
  specialInstructions?: string
  lineItems: PfiLineItem[]
  freightCharges?: number
  packingCharges?: number
  status: PfiStatus
  approvals: { rep: boolean; commercial: boolean; management: boolean }
  rejectionReason?: string
  sentToCustomer?: boolean
  sentDate?: string
  customerAck?: 'Yes' | 'No' | 'Pending'
  createdAt: string
}

export interface PoLineItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface PurchaseOrder {
  id: string
  customerId: string
  pfiId: string
  poNumber?: string
  poDate?: string
  poType?: PoOrderType
  customerReference?: string
  deliveryAddress?: string
  fileName: string
  lineItems: PoLineItem[]
  status: PoStatus
  mismatchNotes?: string
  ackSent?: boolean
  ackDate?: string
  createdAt: string
}

// ── Market Intelligence (tiered) ───────────────────────────────────────────
export type SupplierOrigin =
  | 'India'
  | 'China'
  | 'South Korea'
  | 'Japan'
  | 'Taiwan'
  | 'Germany'
  | 'USA'
  | 'Thailand'
  | 'Other'
export type SupplierPaymentTerms =
  | '100% Advance'
  | '50/50'
  | 'Net 30'
  | 'Net 45'
  | 'Net 60'
  | 'Net 90'
  | 'LC at Sight'
  | 'LC 60 days'
  | 'Other'
export type ContractType =
  | 'Annual Rate Contract'
  | 'PO by PO'
  | 'Spot Purchase'
  | 'Long-term Agreement'
  | 'Blanket PO'
  | 'Other'
export type MarketMotorType =
  | 'BLDC Indoor'
  | 'BLDC Outdoor'
  | 'PSC Motor'
  | 'Universal Motor'
  | 'Direct Drive'
  | 'Stepper'
  | 'PMSM'
  | 'SRM'
  | 'Other'
export type TechnologyShift =
  | 'PSC to BLDC'
  | 'Sensor to Sensorless'
  | 'AC to DC Inverter'
  | 'Single Speed to Variable'
  | 'No Change Planned'
  | 'Other'
export type NewModelLaunch = 'Yes' | 'No' | 'Under Evaluation'
export type IotFeatures =
  | 'Yes – Actively Developing'
  | 'Yes – Evaluating'
  | 'No – Not Yet'
  | 'Not Applicable'
export type FailureMode =
  | 'Bearing Failure'
  | 'Winding Burn'
  | 'Controller IC Failure'
  | 'Capacitor Failure'
  | 'Connector Issue'
  | 'Noise / Vibration'
  | 'Overheating'
  | 'PCB Solder Defect'
  | 'Sensor Failure'
  | 'Other'
export type IncomingInspection =
  | '100% Inspection'
  | 'AQL Sampling Level I'
  | 'AQL Sampling Level II'
  | 'AQL Sampling Level III'
  | 'Skip-lot (Trusted Vendor)'
  | 'No Inspection'
export type ThirdPartyLab =
  | 'Yes – NABL Accredited Lab'
  | 'Yes – Customer-specified Lab'
  | 'No – In-house Testing Accepted'
  | 'Not Sure'
export type LookingForAlt =
  | 'Yes – Urgently'
  | 'Yes – Evaluating'
  | 'Open to Options'
  | 'Not Actively Looking'
  | 'No – Locked In'
export type LocalizationPush =
  | 'Yes – Strong Mandate'
  | 'Yes – Soft Preference'
  | 'Neutral'
  | 'No – Happy with Imports'

export interface CompetitorEntry {
  id: string
  name: string
  price?: number
  qualityRating?: number // 1–10
  leadTimeDays?: number
  keyWeakness?: string
}

export interface MarketIntel {
  id: string
  customerId: string
  // Headline competitor snapshot (kept for backward compatibility / card view)
  competitor: string
  competitorPrice: number
  ourPrice: number
  annualVolume: number
  techNotes?: string
  qualityNotes?: string
  sourcingNotes?: string
  // ── Supplier & Sourcing (Purchase Head) ──
  primarySupplier?: string
  supplierOrigin?: SupplierOrigin
  approvedSuppliers?: number
  currentPurchasePrice?: number
  monthlyOfftake?: number
  importSharePct?: number
  landedCost?: number
  supplierLeadTimeDays?: number
  supplierPaymentTerms?: SupplierPaymentTerms
  targetPrice?: number
  costReductionTargetPct?: number
  secondarySupplier?: string
  contractType?: ContractType
  // ── Technical Specs (R&D Head) ──
  currentMotorType?: MarketMotorType
  voltage?: number
  wattage?: number
  poles?: number
  sensorType?: string
  efficiencyTarget?: string
  noiseLevelDb?: number
  technologyShift?: TechnologyShift
  newModelLaunch?: NewModelLaunch
  iotFeatures?: IotFeatures
  operatingTempRange?: string
  // ── Quality Parameters (Quality Head) ──
  rejectionPpm?: number
  topFailureMode?: FailureMode
  testingDurationWeeks?: number
  testStandards?: string
  reliabilityTestHours?: number
  fieldFailureRatePct?: number
  incomingInspection?: IncomingInspection
  certificationsRequired?: string
  thirdPartyLab?: ThirdPartyLab
  // ── Opportunity Sizing ──
  matchingSkuId?: string
  vendorApprovalMonths?: number
  lookingForAlt?: LookingForAlt
  localizationPush?: LocalizationPush
  // ── Competitive landscape ──
  competitors?: CompetitorEntry[]
  createdAt: string
}

// ── Order Execution (post Closed-Won) ──────────────────────────────────────
export type DispatchStatus = 'Pending' | 'In Production' | 'Dispatched' | 'Delivered'
export type ExecPaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid'

export interface OrderExecution {
  id: string
  dealId: string
  customerId: string
  poId?: string
  productionNotified: boolean
  // Dispatch
  dispatchStatus: DispatchStatus
  orderedQty?: number
  dispatchDate?: string
  dispatchedQty?: number
  courier?: string
  tracking?: string
  deliveredDate?: string
  // Invoice
  invoiceNumber?: string
  invoiceDate?: string
  invoiceAmount?: number
  // Payment
  paymentStatus: ExecPaymentStatus
  amountReceived?: number
  paymentDueDate?: string
  notes?: string
  createdAt: string
}

// ── Internal Readiness Tracker ─────────────────────────────────────────────
export type ReadinessStatus = 'Not Started' | 'In Progress' | 'Ready' | 'Blocked' | 'N/A'

export interface ReadinessItem {
  id: string
  dealId: string
  category: string
  detail?: string
  status: ReadinessStatus
  owner?: string
  targetDate?: string
  createdAt: string
}

export interface TripExpense {
  category: 'Transport' | 'Hotel' | 'Food' | 'DA' | 'Local' | 'Other'
  amount: number
  date?: string
  paymentMode?: 'Company Card' | 'Personal' | 'From Advance' | 'UPI / Online'
  note?: string
}

export interface Trip {
  id: string
  name: string
  type: 'Single City' | 'Multi City'
  startDate: string
  endDate: string
  destination: string
  mode: 'Flight' | 'Train' | 'Car' | 'Bus'
  employees: string[]
  budget: number
  advance?: number
  objective?: string
  approvalStatus?: TripApprovalStatus
  approvedBy?: string
  status: 'Planned' | 'Approved' | 'Completed'
  plannedDealIds: string[]
  expenses: TripExpense[]
  postTripOutcome?: string
  followUpActions?: string
  createdAt: string
}
