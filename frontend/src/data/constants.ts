import type {
  BuyingRole,
  ContractType,
  Department,
  DeliveryTerms,
  DispatchStatus,
  ExecPaymentStatus,
  FailureMode,
  IncomingInspection,
  IotFeatures,
  LocalizationPush,
  LookingForAlt,
  MarketMotorType,
  MotorType,
  NewModelLaunch,
  PaymentTerms,
  ReadinessStatus,
  SensorType,
  SupplierOrigin,
  SupplierPaymentTerms,
  TechnologyShift,
  ThirdPartyLab,
} from './types'

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export const LEAD_SOURCES = [
  'Trade Expo',
  'Referral',
  'Cold Outreach',
  'Website Inquiry',
  'LinkedIn',
  'Industry Event',
  'Customer Request',
  'Other',
]

export const REVENUE_RANGES = [
  '< 100 Cr',
  '100–500 Cr',
  '500–1000 Cr',
  '1000–5000 Cr',
  '> 5000 Cr',
] as const

export const LOST_REASONS = [
  'Price',
  'Quality',
  'Lead Time',
  'Competition',
  'Budget',
  'Technical Fit',
  'Relationship',
  'Customer Internal Decision',
  'Other',
] as const

export const DEPARTMENTS: Department[] = [
  'R&D',
  'Purchase',
  'Vendor Development',
  'Quality',
  'Management',
  'Operations',
  'Finance',
  'Other',
]

export const BUYING_ROLES: BuyingRole[] = [
  'Decision Maker',
  'Influencer',
  'Gatekeeper',
  'User',
  'Champion',
]

export const MOTOR_TYPES: MotorType[] = [
  'BLDC Indoor',
  'BLDC Outdoor',
  'PSC',
  'Universal',
  'Direct Drive',
  'Stepper',
  'PMSM',
  'Other',
]

export const SENSOR_TYPES: SensorType[] = [
  'Hall',
  'Sensorless Back-EMF',
  'Encoder Optical',
  'Encoder Magnetic',
  'Resolver',
]

export const PAYMENT_TERMS: PaymentTerms[] = [
  '100% Advance',
  '50% Advance, 50% on Delivery',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  'Letter of Credit (LC)',
  'Other',
]

export const DELIVERY_TERMS: DeliveryTerms[] = [
  'Ex-Works',
  'FOR Destination',
  'CIF',
  'FOB',
  'DAP',
  'Other',
]

export const PFI_TYPES = ['Trial Order', 'Annual Contract', 'Spot Order', 'Rate Contract'] as const

export const PO_ORDER_TYPES = [
  'Trial Order',
  'Mass Production',
  'Repeat Order',
  'Spot Order',
  'Rate Contract',
] as const

export const UOM_OPTIONS = ['Pcs', 'Set', 'Nos', 'Kit'] as const

export const TRIP_APPROVAL_STATUSES = ['Draft', 'Pending', 'Approved', 'Rejected'] as const

export const GST_RATES = [0, 5, 12, 18, 28] as const

// ── Market Intelligence option sets ────────────────────────────────────
export const SUPPLIER_ORIGINS: SupplierOrigin[] = [
  'India',
  'China',
  'South Korea',
  'Japan',
  'Taiwan',
  'Germany',
  'USA',
  'Thailand',
  'Other',
]
export const SUPPLIER_PAYMENT_TERMS: SupplierPaymentTerms[] = [
  '100% Advance',
  '50/50',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  'LC at Sight',
  'LC 60 days',
  'Other',
]
export const CONTRACT_TYPES: ContractType[] = [
  'Annual Rate Contract',
  'PO by PO',
  'Spot Purchase',
  'Long-term Agreement',
  'Blanket PO',
  'Other',
]
export const MARKET_MOTOR_TYPES: MarketMotorType[] = [
  'BLDC Indoor',
  'BLDC Outdoor',
  'PSC Motor',
  'Universal Motor',
  'Direct Drive',
  'Stepper',
  'PMSM',
  'SRM',
  'Other',
]
export const TECHNOLOGY_SHIFTS: TechnologyShift[] = [
  'PSC to BLDC',
  'Sensor to Sensorless',
  'AC to DC Inverter',
  'Single Speed to Variable',
  'No Change Planned',
  'Other',
]
export const NEW_MODEL_LAUNCH: NewModelLaunch[] = ['Yes', 'No', 'Under Evaluation']
export const IOT_FEATURES: IotFeatures[] = [
  'Yes – Actively Developing',
  'Yes – Evaluating',
  'No – Not Yet',
  'Not Applicable',
]
export const FAILURE_MODES: FailureMode[] = [
  'Bearing Failure',
  'Winding Burn',
  'Controller IC Failure',
  'Capacitor Failure',
  'Connector Issue',
  'Noise / Vibration',
  'Overheating',
  'PCB Solder Defect',
  'Sensor Failure',
  'Other',
]
export const INCOMING_INSPECTION: IncomingInspection[] = [
  '100% Inspection',
  'AQL Sampling Level I',
  'AQL Sampling Level II',
  'AQL Sampling Level III',
  'Skip-lot (Trusted Vendor)',
  'No Inspection',
]
export const THIRD_PARTY_LAB: ThirdPartyLab[] = [
  'Yes – NABL Accredited Lab',
  'Yes – Customer-specified Lab',
  'No – In-house Testing Accepted',
  'Not Sure',
]
export const LOOKING_FOR_ALT: LookingForAlt[] = [
  'Yes – Urgently',
  'Yes – Evaluating',
  'Open to Options',
  'Not Actively Looking',
  'No – Locked In',
]
export const LOCALIZATION_PUSH: LocalizationPush[] = [
  'Yes – Strong Mandate',
  'Yes – Soft Preference',
  'Neutral',
  'No – Happy with Imports',
]
export const MARKET_SENSOR_TYPES = [
  'Hall Sensor (3-wire)',
  'Sensorless (Back-EMF)',
  'Encoder (Optical)',
  'Encoder (Magnetic)',
  'Resolver',
  'Other',
]

// ── Order Execution option sets ────────────────────────────────────────
export const DISPATCH_STATUSES: DispatchStatus[] = [
  'Pending',
  'In Production',
  'Dispatched',
  'Delivered',
]
export const EXEC_PAYMENT_STATUSES: ExecPaymentStatus[] = ['Unpaid', 'Partially Paid', 'Paid']

// ── Internal Readiness Tracker option sets ─────────────────────────────
export const READINESS_CATEGORIES = [
  'Vendor Registration',
  'Tooling & Fixtures',
  'Production Capacity',
  'Raw Material / Components',
  'Quality Documentation',
  'Test Reports',
  'Certifications (BIS/ISO)',
  'Logistics & Packaging',
]
export const READINESS_STATUSES: ReadinessStatus[] = [
  'Not Started',
  'In Progress',
  'Ready',
  'Blocked',
  'N/A',
]
