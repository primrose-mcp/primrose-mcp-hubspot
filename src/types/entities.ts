/**
 * CRM Entity Types
 *
 * Standard data structures for CRM entities.
 * Map your CRM's specific fields to these types in the client.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Number of items to return */
  limit?: number;
  /** Cursor for pagination (CRM-specific format) */
  cursor?: string;
  /** Offset for offset-based pagination */
  offset?: number;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  items: T[];
  /** Number of items in this response */
  count: number;
  /** Total count (if available) */
  total?: number;
  /** Whether more items are available */
  hasMore: boolean;
  /** Cursor for next page */
  nextCursor?: string;
}

// =============================================================================
// Search
// =============================================================================

export interface SearchParams extends PaginationParams {
  /** Search query string */
  query?: string;
  /** Filters to apply */
  filters?: SearchFilter[];
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilter {
  /** Field to filter on */
  field: string;
  /** Filter operator */
  operator: FilterOperator;
  /** Filter value */
  value: unknown;
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null';

// =============================================================================
// Contact
// =============================================================================

export interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  title?: string;
  department?: string;
  companyId?: string;
  companyName?: string;
  lifecycleStage?: string;
  source?: string;
  status?: string;
  address?: Address;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export interface ContactCreateInput {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  title?: string;
  companyId?: string;
  source?: string;
  customFields?: Record<string, unknown>;
}

export interface ContactUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  companyId?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Company
// =============================================================================

export interface Company {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  description?: string;
  numberOfEmployees?: number;
  annualRevenue?: number;
  revenueCurrency?: string;
  type?: string;
  lifecycleStage?: string;
  phone?: string;
  address?: Address;
  linkedInUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export interface CompanyCreateInput {
  name: string;
  domain?: string;
  industry?: string;
  description?: string;
  numberOfEmployees?: number;
  type?: string;
  phone?: string;
  address?: Partial<Address>;
  customFields?: Record<string, unknown>;
}

export interface CompanyUpdateInput {
  name?: string;
  domain?: string;
  industry?: string;
  description?: string;
  numberOfEmployees?: number;
  type?: string;
  phone?: string;
  address?: Partial<Address>;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Deal / Opportunity
// =============================================================================

export interface Deal {
  id: string;
  name: string;
  amount?: number;
  currency?: string;
  stage?: string;
  stageId?: string;
  pipelineId?: string;
  pipelineName?: string;
  probability?: number;
  closeDate?: string;
  status?: DealStatus;
  type?: string;
  source?: string;
  description?: string;
  companyId?: string;
  companyName?: string;
  contactIds?: string[];
  closeReason?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export type DealStatus = 'open' | 'won' | 'lost';

export interface DealCreateInput {
  name: string;
  amount?: number;
  currency?: string;
  stageId?: string;
  pipelineId?: string;
  closeDate?: string;
  companyId?: string;
  contactIds?: string[];
  customFields?: Record<string, unknown>;
}

export interface DealUpdateInput {
  name?: string;
  amount?: number;
  currency?: string;
  stageId?: string;
  closeDate?: string;
  status?: DealStatus;
  closeReason?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Pipeline
// =============================================================================

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault?: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability?: number;
  isClosed?: boolean;
  isWon?: boolean;
}

// =============================================================================
// Activity
// =============================================================================

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  body?: string;
  status?: ActivityStatus;
  dueDate?: string;
  completedDate?: string;
  durationMinutes?: number;
  activityDate?: string;
  contactIds?: string[];
  companyId?: string;
  dealId?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note' | 'other';
export type ActivityStatus = 'pending' | 'completed' | 'cancelled';

export interface ActivityCreateInput {
  type: ActivityType;
  subject: string;
  body?: string;
  dueDate?: string;
  contactIds?: string[];
  companyId?: string;
  dealId?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Common
// =============================================================================

export interface Address {
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// =============================================================================
// Ticket
// =============================================================================

export interface Ticket {
  id: string;
  subject: string;
  content?: string;
  status?: string;
  priority?: string;
  pipelineId?: string;
  stageId?: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  customFields?: Record<string, unknown>;
}

export interface TicketCreateInput {
  subject: string;
  content?: string;
  pipelineId?: string;
  stageId?: string;
  priority?: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export interface TicketUpdateInput {
  subject?: string;
  content?: string;
  status?: string;
  priority?: string;
  stageId?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Product
// =============================================================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  sku?: string;
  recurringBillingPeriod?: string;
  createdAt?: string;
  updatedAt?: string;
  customFields?: Record<string, unknown>;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  price?: number;
  sku?: string;
  recurringBillingPeriod?: string;
  customFields?: Record<string, unknown>;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  recurringBillingPeriod?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Line Item
// =============================================================================

export interface LineItem {
  id: string;
  name: string;
  quantity?: number;
  price?: number;
  amount?: number;
  discount?: number;
  productId?: string;
  dealId?: string;
  createdAt?: string;
  updatedAt?: string;
  customFields?: Record<string, unknown>;
}

export interface LineItemCreateInput {
  name: string;
  quantity?: number;
  price?: number;
  discount?: number;
  productId?: string;
  dealId?: string;
  customFields?: Record<string, unknown>;
}

export interface LineItemUpdateInput {
  name?: string;
  quantity?: number;
  price?: number;
  discount?: number;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Quote
// =============================================================================

export interface Quote {
  id: string;
  title: string;
  status?: string;
  expirationDate?: string;
  dealId?: string;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  customFields?: Record<string, unknown>;
}

export interface QuoteCreateInput {
  title: string;
  expirationDate?: string;
  dealId?: string;
  customFields?: Record<string, unknown>;
}

export interface QuoteUpdateInput {
  title?: string;
  expirationDate?: string;
  status?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Note
// =============================================================================

export interface Note {
  id: string;
  body: string;
  timestamp?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteCreateInput {
  body: string;
  timestamp?: string;
  ownerId?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
}

export interface NoteUpdateInput {
  body?: string;
  timestamp?: string;
  ownerId?: string;
}

// =============================================================================
// Meeting
// =============================================================================

export interface Meeting {
  id: string;
  title: string;
  body?: string;
  startTime?: string;
  endTime?: string;
  outcome?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MeetingCreateInput {
  title: string;
  body?: string;
  startTime: string;
  endTime: string;
  contactIds?: string[];
  outcome?: string;
  ownerId?: string;
}

export interface MeetingUpdateInput {
  title?: string;
  body?: string;
  startTime?: string;
  endTime?: string;
  outcome?: string;
  ownerId?: string;
}

// =============================================================================
// Lead
// =============================================================================

export interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  customFields?: Record<string, unknown>;
}

export interface LeadCreateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

export interface LeadUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  source?: string;
  ownerId?: string;
  customFields?: Record<string, unknown>;
}

// =============================================================================
// Association
// =============================================================================

export interface Association {
  fromObjectId: string;
  fromObjectType: string;
  toObjectId: string;
  toObjectType: string;
  associationTypeId: string;
  label?: string;
}

export interface AssociationLabel {
  category: string;
  typeId: number;
  label: string;
}

// =============================================================================
// Property
// =============================================================================

export interface Property {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  groupName: string;
  description?: string;
  options?: PropertyOption[];
}

export interface PropertyOption {
  label: string;
  value: string;
  displayOrder: number;
  hidden: boolean;
}

export interface PropertyCreateInput {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'datetime' | 'enumeration' | 'bool';
  fieldType:
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'booleancheckbox';
  groupName: string;
  description?: string;
  options?: PropertyOption[];
}

export interface PropertyUpdateInput {
  label?: string;
  description?: string;
  options?: PropertyOption[];
}

export interface PropertyGroup {
  name: string;
  label: string;
  displayOrder: number;
}

// =============================================================================
// Batch Operations
// =============================================================================

export interface BatchReadInput {
  ids: string[];
  properties?: string[];
}

export interface BatchCreateInput<T> {
  inputs: T[];
}

export interface BatchUpdateInput<T> {
  inputs: Array<{ id: string } & T>;
}

export interface BatchArchiveInput {
  ids: string[];
}

export interface BatchResult<T> {
  status: string;
  results: T[];
  errors?: Array<{ status: string; message: string; id?: string }>;
}

// =============================================================================
// Owner
// =============================================================================

export interface Owner {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// =============================================================================
// Pipeline (Extended)
// =============================================================================

export interface PipelineCreateInput {
  label: string;
  displayOrder?: number;
  stages: PipelineStageInput[];
}

export interface PipelineUpdateInput {
  label?: string;
  displayOrder?: number;
}

export interface PipelineStageInput {
  label: string;
  displayOrder: number;
  metadata?: {
    probability?: number;
    isClosed?: boolean;
  };
}

export interface PipelineStageUpdateInput {
  label?: string;
  displayOrder?: number;
  metadata?: {
    probability?: number;
    isClosed?: boolean;
  };
}

// =============================================================================
// Webhook
// =============================================================================

export interface Webhook {
  id: string;
  createdAt: string;
  subscriptions: WebhookSubscription[];
}

export interface WebhookSubscription {
  id: string;
  propertyName?: string;
  active: boolean;
  subscriptionType: string;
}

// =============================================================================
// Commerce Objects
// =============================================================================

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  status?: string;
  dueDate?: string;
  totalAmount?: number;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';
