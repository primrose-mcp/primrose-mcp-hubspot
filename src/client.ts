/**
 * HubSpot CRM API Client
 *
 * Implements HubSpot API v3 for CRM operations.
 * Reference: https://developers.hubspot.com/docs/api/crm
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different API keys.
 */

import type {
  Activity,
  ActivityCreateInput,
  Association,
  AssociationLabel,
  BatchResult,
  Company,
  CompanyCreateInput,
  CompanyUpdateInput,
  Contact,
  ContactCreateInput,
  ContactUpdateInput,
  Deal,
  DealCreateInput,
  DealUpdateInput,
  Invoice,
  Lead,
  LeadCreateInput,
  LeadUpdateInput,
  LineItem,
  LineItemCreateInput,
  LineItemUpdateInput,
  Meeting,
  MeetingCreateInput,
  MeetingUpdateInput,
  Note,
  NoteCreateInput,
  NoteUpdateInput,
  Order,
  Owner,
  PaginatedResponse,
  PaginationParams,
  Pipeline,
  PipelineCreateInput,
  PipelineStage,
  PipelineStageInput,
  PipelineStageUpdateInput,
  PipelineUpdateInput,
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  Property,
  PropertyCreateInput,
  PropertyGroup,
  PropertyUpdateInput,
  Quote,
  QuoteCreateInput,
  QuoteUpdateInput,
  SearchParams,
  Ticket,
  TicketCreateInput,
  TicketUpdateInput,
  WebhookSubscription,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, CrmApiError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = 'https://api.hubapi.com';

// Default properties to fetch for each object type
const CONTACT_PROPERTIES =
  'firstname,lastname,email,phone,jobtitle,company,lifecyclestage,hs_lead_status,createdate,lastmodifieddate';
const COMPANY_PROPERTIES =
  'name,domain,website,industry,description,numberofemployees,annualrevenue,type,phone,createdate,lastmodifieddate';
const DEAL_PROPERTIES =
  'dealname,amount,dealstage,pipeline,closedate,hs_deal_stage_probability,createdate,lastmodifieddate';
const TICKET_PROPERTIES =
  'subject,content,hs_pipeline,hs_pipeline_stage,hs_ticket_priority,hubspot_owner_id,createdate,lastmodifieddate';
const PRODUCT_PROPERTIES =
  'name,description,price,hs_sku,hs_recurring_billing_period,createdate,lastmodifieddate';
const LINE_ITEM_PROPERTIES =
  'name,quantity,price,amount,discount,hs_product_id,createdate,lastmodifieddate';
const QUOTE_PROPERTIES =
  'hs_title,hs_status,hs_expiration_date,hs_deal_id,hs_total,createdate,lastmodifieddate';
const NOTE_PROPERTIES = 'hs_note_body,hs_timestamp,hubspot_owner_id,createdate,lastmodifieddate';
const MEETING_PROPERTIES =
  'hs_meeting_title,hs_meeting_body,hs_meeting_start_time,hs_meeting_end_time,hs_meeting_outcome,hubspot_owner_id,createdate,lastmodifieddate';
const LEAD_PROPERTIES =
  'firstname,lastname,email,phone,company,hs_lead_status,hs_leadstatus,createdate,lastmodifieddate';
const INVOICE_PROPERTIES = 'hs_number,hs_status,hs_due_date,hs_amount_billed,hs_currency,createdate';
const ORDER_PROPERTIES = 'hs_order_name,hs_external_order_id,hs_fulfillment_status,hs_total_price,createdate';

// =============================================================================
// HubSpot API Response Types
// =============================================================================

interface HubSpotObject {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

interface HubSpotListResponse {
  results: HubSpotObject[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

interface HubSpotSearchResponse {
  total: number;
  results: HubSpotObject[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

interface HubSpotPipeline {
  id: string;
  label: string;
  displayOrder: number;
  stages: HubSpotPipelineStage[];
}

interface HubSpotPipelineStage {
  id: string;
  label: string;
  displayOrder: number;
  metadata: {
    probability?: string;
    isClosed?: string;
  };
}

interface HubSpotPipelinesResponse {
  results: HubSpotPipeline[];
}

// =============================================================================
// CRM Client Interface
// =============================================================================

export interface CrmClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Contacts
  listContacts(params?: PaginationParams): Promise<PaginatedResponse<Contact>>;
  getContact(id: string): Promise<Contact>;
  createContact(input: ContactCreateInput): Promise<Contact>;
  updateContact(id: string, input: ContactUpdateInput): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  searchContacts(params: SearchParams): Promise<PaginatedResponse<Contact>>;

  // Companies
  listCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>>;
  getCompany(id: string): Promise<Company>;
  createCompany(input: CompanyCreateInput): Promise<Company>;
  updateCompany(id: string, input: CompanyUpdateInput): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  searchCompanies(params: SearchParams): Promise<PaginatedResponse<Company>>;

  // Deals
  listDeals(params?: PaginationParams): Promise<PaginatedResponse<Deal>>;
  getDeal(id: string): Promise<Deal>;
  createDeal(input: DealCreateInput): Promise<Deal>;
  updateDeal(id: string, input: DealUpdateInput): Promise<Deal>;
  deleteDeal(id: string): Promise<void>;
  moveDealStage(id: string, stageId: string): Promise<Deal>;
  searchDeals(params: SearchParams): Promise<PaginatedResponse<Deal>>;
  listPipelines(objectType?: string): Promise<Pipeline[]>;

  // Tickets
  listTickets(params?: PaginationParams): Promise<PaginatedResponse<Ticket>>;
  getTicket(id: string): Promise<Ticket>;
  createTicket(input: TicketCreateInput): Promise<Ticket>;
  updateTicket(id: string, input: TicketUpdateInput): Promise<Ticket>;
  deleteTicket(id: string): Promise<void>;
  searchTickets(params: SearchParams): Promise<PaginatedResponse<Ticket>>;
  listTicketPipelines(): Promise<Pipeline[]>;

  // Products
  listProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>>;
  getProduct(id: string): Promise<Product>;
  createProduct(input: ProductCreateInput): Promise<Product>;
  updateProduct(id: string, input: ProductUpdateInput): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  searchProducts(params: SearchParams): Promise<PaginatedResponse<Product>>;

  // Line Items
  listLineItems(params?: PaginationParams): Promise<PaginatedResponse<LineItem>>;
  getLineItem(id: string): Promise<LineItem>;
  createLineItem(input: LineItemCreateInput): Promise<LineItem>;
  updateLineItem(id: string, input: LineItemUpdateInput): Promise<LineItem>;
  deleteLineItem(id: string): Promise<void>;

  // Quotes
  listQuotes(params?: PaginationParams): Promise<PaginatedResponse<Quote>>;
  getQuote(id: string): Promise<Quote>;
  createQuote(input: QuoteCreateInput): Promise<Quote>;
  updateQuote(id: string, input: QuoteUpdateInput): Promise<Quote>;

  // Notes
  listNotes(params?: PaginationParams): Promise<PaginatedResponse<Note>>;
  getNote(id: string): Promise<Note>;
  createNote(input: NoteCreateInput): Promise<Note>;
  updateNote(id: string, input: NoteUpdateInput): Promise<Note>;
  deleteNote(id: string): Promise<void>;

  // Meetings
  listMeetings(params?: PaginationParams): Promise<PaginatedResponse<Meeting>>;
  getMeeting(id: string): Promise<Meeting>;
  createMeeting(input: MeetingCreateInput): Promise<Meeting>;
  updateMeeting(id: string, input: MeetingUpdateInput): Promise<Meeting>;
  deleteMeeting(id: string): Promise<void>;

  // Leads
  listLeads(params?: PaginationParams): Promise<PaginatedResponse<Lead>>;
  getLead(id: string): Promise<Lead>;
  createLead(input: LeadCreateInput): Promise<Lead>;
  updateLead(id: string, input: LeadUpdateInput): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  searchLeads(params: SearchParams): Promise<PaginatedResponse<Lead>>;

  // Associations
  createAssociation(
    fromObjectType: string,
    fromObjectId: string,
    toObjectType: string,
    toObjectId: string,
    associationTypeId: string
  ): Promise<void>;
  deleteAssociation(
    fromObjectType: string,
    fromObjectId: string,
    toObjectType: string,
    toObjectId: string,
    associationTypeId: string
  ): Promise<void>;
  listAssociations(
    objectType: string,
    objectId: string,
    toObjectType: string
  ): Promise<Association[]>;
  getAssociationLabels(fromObjectType: string, toObjectType: string): Promise<AssociationLabel[]>;

  // Properties
  listProperties(objectType: string): Promise<Property[]>;
  getProperty(objectType: string, propertyName: string): Promise<Property>;
  createProperty(objectType: string, input: PropertyCreateInput): Promise<Property>;
  updateProperty(objectType: string, propertyName: string, input: PropertyUpdateInput): Promise<Property>;
  deleteProperty(objectType: string, propertyName: string): Promise<void>;
  listPropertyGroups(objectType: string): Promise<PropertyGroup[]>;

  // Batch Operations
  batchReadContacts(ids: string[], properties?: string[]): Promise<BatchResult<Contact>>;
  batchCreateContacts(inputs: ContactCreateInput[]): Promise<BatchResult<Contact>>;
  batchUpdateContacts(inputs: Array<{ id: string } & ContactUpdateInput>): Promise<BatchResult<Contact>>;
  batchArchiveContacts(ids: string[]): Promise<void>;
  batchReadCompanies(ids: string[], properties?: string[]): Promise<BatchResult<Company>>;
  batchCreateCompanies(inputs: CompanyCreateInput[]): Promise<BatchResult<Company>>;
  batchUpdateCompanies(inputs: Array<{ id: string } & CompanyUpdateInput>): Promise<BatchResult<Company>>;
  batchArchiveCompanies(ids: string[]): Promise<void>;
  batchReadDeals(ids: string[], properties?: string[]): Promise<BatchResult<Deal>>;
  batchCreateDeals(inputs: DealCreateInput[]): Promise<BatchResult<Deal>>;
  batchUpdateDeals(inputs: Array<{ id: string } & DealUpdateInput>): Promise<BatchResult<Deal>>;
  batchArchiveDeals(ids: string[]): Promise<void>;
  batchReadTickets(ids: string[], properties?: string[]): Promise<BatchResult<Ticket>>;
  batchCreateTickets(inputs: TicketCreateInput[]): Promise<BatchResult<Ticket>>;
  batchUpdateTickets(inputs: Array<{ id: string } & TicketUpdateInput>): Promise<BatchResult<Ticket>>;
  batchArchiveTickets(ids: string[]): Promise<void>;

  // Owners
  listOwners(): Promise<Owner[]>;
  getOwner(id: string): Promise<Owner>;

  // Extended Pipelines
  getPipeline(objectType: string, pipelineId: string): Promise<Pipeline>;
  createPipeline(objectType: string, input: PipelineCreateInput): Promise<Pipeline>;
  updatePipeline(objectType: string, pipelineId: string, input: PipelineUpdateInput): Promise<Pipeline>;
  deletePipeline(objectType: string, pipelineId: string): Promise<void>;
  getPipelineStage(objectType: string, pipelineId: string, stageId: string): Promise<PipelineStage>;
  createPipelineStage(objectType: string, pipelineId: string, input: PipelineStageInput): Promise<PipelineStage>;
  updatePipelineStage(
    objectType: string,
    pipelineId: string,
    stageId: string,
    input: PipelineStageUpdateInput
  ): Promise<PipelineStage>;
  deletePipelineStage(objectType: string, pipelineId: string, stageId: string): Promise<void>;

  // Webhooks
  listWebhookSubscriptions(appId: string): Promise<WebhookSubscription[]>;

  // Commerce Objects
  listInvoices(params?: PaginationParams): Promise<PaginatedResponse<Invoice>>;
  getInvoice(id: string): Promise<Invoice>;
  listOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>>;
  getOrder(id: string): Promise<Order>;

  // Activities
  listActivities(
    params?: PaginationParams & { recordId?: string }
  ): Promise<PaginatedResponse<Activity>>;
  createActivity(input: ActivityCreateInput): Promise<Activity>;
  logCall(
    contactId: string,
    subject: string,
    notes?: string,
    durationMinutes?: number
  ): Promise<Activity>;
  logEmail(
    contactId: string,
    subject: string,
    body: string,
    direction: 'sent' | 'received'
  ): Promise<Activity>;
}

// =============================================================================
// CRM Client Implementation
// =============================================================================

class CrmClientImpl implements CrmClient {
  private credentials: TenantCredentials;
  private baseUrl: string;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl || API_BASE_URL;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    // OAuth Access Token (preferred if available)
    if (this.credentials.accessToken) {
      return {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json',
      };
    }

    // API Key authentication
    if (this.credentials.apiKey) {
      return {
        Authorization: `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json',
      };
    }

    throw new AuthenticationError(
      'No credentials provided. Include X-CRM-API-Key or X-CRM-Access-Token header.'
    );
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your API credentials.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      let message = `API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.message || errorJson.error || message;
      } catch {
        // Use default message
      }
      throw new CrmApiError(message, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      await this.request<HubSpotListResponse>('/crm/v3/objects/contacts?limit=1');
      return { connected: true, message: 'Successfully connected to HubSpot CRM' };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Contacts
  // ===========================================================================

  private mapHubSpotContact(obj: HubSpotObject): Contact {
    const props = obj.properties;
    return {
      id: obj.id,
      firstName: props.firstname || undefined,
      lastName: props.lastname || undefined,
      fullName:
        props.firstname || props.lastname
          ? `${props.firstname || ''} ${props.lastname || ''}`.trim()
          : undefined,
      email: props.email || undefined,
      phone: props.phone || undefined,
      title: props.jobtitle || undefined,
      companyName: props.company || undefined,
      lifecycleStage: props.lifecyclestage || undefined,
      status: props.hs_lead_status || undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listContacts(params?: PaginationParams): Promise<PaginatedResponse<Contact>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: CONTACT_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/contacts?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotContact(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getContact(id: string): Promise<Contact> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/contacts/${id}?properties=${CONTACT_PROPERTIES}`
    );
    return this.mapHubSpotContact(response);
  }

  async createContact(input: ContactCreateInput): Promise<Contact> {
    const properties: Record<string, string> = {};

    if (input.firstName) properties.firstname = input.firstName;
    if (input.lastName) properties.lastname = input.lastName;
    if (input.email) properties.email = input.email;
    if (input.phone) properties.phone = input.phone;
    if (input.title) properties.jobtitle = input.title;

    // Handle custom fields
    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>('/crm/v3/objects/contacts', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotContact(response);
  }

  async updateContact(id: string, input: ContactUpdateInput): Promise<Contact> {
    const properties: Record<string, string> = {};

    if (input.firstName !== undefined) properties.firstname = input.firstName;
    if (input.lastName !== undefined) properties.lastname = input.lastName;
    if (input.email !== undefined) properties.email = input.email;
    if (input.phone !== undefined) properties.phone = input.phone;
    if (input.title !== undefined) properties.jobtitle = input.title;

    // Handle custom fields
    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotContact(response);
  }

  async deleteContact(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async searchContacts(params: SearchParams): Promise<PaginatedResponse<Contact>> {
    const body: Record<string, unknown> = {
      limit: params.limit || 20,
      properties: CONTACT_PROPERTIES.split(','),
    };

    if (params.query) {
      body.query = params.query;
    }

    if (params.cursor) {
      body.after = params.cursor;
    }

    if (params.filters && params.filters.length > 0) {
      body.filterGroups = [
        {
          filters: params.filters.map((f) => ({
            propertyName: f.field,
            operator: this.mapFilterOperator(f.operator),
            value: f.value,
          })),
        },
      ];
    }

    if (params.sortBy) {
      body.sorts = [
        {
          propertyName: params.sortBy,
          direction: params.sortOrder === 'desc' ? 'DESCENDING' : 'ASCENDING',
        },
      ];
    }

    const response = await this.request<HubSpotSearchResponse>('/crm/v3/objects/contacts/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      items: response.results.map((obj) => this.mapHubSpotContact(obj)),
      count: response.results.length,
      total: response.total,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  private mapFilterOperator(op: string): string {
    const mapping: Record<string, string> = {
      eq: 'EQ',
      neq: 'NEQ',
      lt: 'LT',
      lte: 'LTE',
      gt: 'GT',
      gte: 'GTE',
      contains: 'CONTAINS_TOKEN',
      not_contains: 'NOT_CONTAINS_TOKEN',
      in: 'IN',
      not_in: 'NOT_IN',
      is_null: 'NOT_HAS_PROPERTY',
      is_not_null: 'HAS_PROPERTY',
    };
    return mapping[op] || 'EQ';
  }

  // ===========================================================================
  // Companies
  // ===========================================================================

  private mapHubSpotCompany(obj: HubSpotObject): Company {
    const props = obj.properties;
    return {
      id: obj.id,
      name: props.name || '',
      domain: props.domain || undefined,
      website: props.website || undefined,
      industry: props.industry || undefined,
      description: props.description || undefined,
      numberOfEmployees: props.numberofemployees ? parseInt(props.numberofemployees, 10) : undefined,
      annualRevenue: props.annualrevenue ? parseFloat(props.annualrevenue) : undefined,
      type: props.type || undefined,
      phone: props.phone || undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: COMPANY_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/companies?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotCompany(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getCompany(id: string): Promise<Company> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/companies/${id}?properties=${COMPANY_PROPERTIES}`
    );
    return this.mapHubSpotCompany(response);
  }

  async createCompany(input: CompanyCreateInput): Promise<Company> {
    const properties: Record<string, string> = {};

    if (input.name) properties.name = input.name;
    if (input.domain) properties.domain = input.domain;
    if (input.industry) properties.industry = input.industry;
    if (input.description) properties.description = input.description;
    if (input.numberOfEmployees !== undefined)
      properties.numberofemployees = String(input.numberOfEmployees);
    if (input.type) properties.type = input.type;
    if (input.phone) properties.phone = input.phone;

    // Handle custom fields
    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>('/crm/v3/objects/companies', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotCompany(response);
  }

  async updateCompany(id: string, input: CompanyUpdateInput): Promise<Company> {
    const properties: Record<string, string> = {};

    if (input.name !== undefined) properties.name = input.name;
    if (input.domain !== undefined) properties.domain = input.domain;
    if (input.industry !== undefined) properties.industry = input.industry;
    if (input.description !== undefined) properties.description = input.description;
    if (input.numberOfEmployees !== undefined)
      properties.numberofemployees = String(input.numberOfEmployees);
    if (input.type !== undefined) properties.type = input.type;
    if (input.phone !== undefined) properties.phone = input.phone;

    // Handle custom fields
    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotCompany(response);
  }

  // ===========================================================================
  // Deals
  // ===========================================================================

  private mapHubSpotDeal(obj: HubSpotObject): Deal {
    const props = obj.properties;
    return {
      id: obj.id,
      name: props.dealname || '',
      amount: props.amount ? parseFloat(props.amount) : undefined,
      stageId: props.dealstage || undefined,
      stage: props.dealstage || undefined,
      pipelineId: props.pipeline || undefined,
      closeDate: props.closedate || undefined,
      probability: props.hs_deal_stage_probability
        ? parseFloat(props.hs_deal_stage_probability)
        : undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listDeals(params?: PaginationParams): Promise<PaginatedResponse<Deal>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: DEAL_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(`/crm/v3/objects/deals?${queryParams}`);

    return {
      items: response.results.map((obj) => this.mapHubSpotDeal(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getDeal(id: string): Promise<Deal> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/deals/${id}?properties=${DEAL_PROPERTIES}`
    );
    return this.mapHubSpotDeal(response);
  }

  async createDeal(input: DealCreateInput): Promise<Deal> {
    const properties: Record<string, string> = {};

    if (input.name) properties.dealname = input.name;
    if (input.amount !== undefined) properties.amount = String(input.amount);
    if (input.stageId) properties.dealstage = input.stageId;
    if (input.pipelineId) properties.pipeline = input.pipelineId;
    if (input.closeDate) properties.closedate = input.closeDate;

    // Handle custom fields
    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>('/crm/v3/objects/deals', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotDeal(response);
  }

  async updateDeal(id: string, input: DealUpdateInput): Promise<Deal> {
    const properties: Record<string, string> = {};

    if (input.name !== undefined) properties.dealname = input.name;
    if (input.amount !== undefined) properties.amount = String(input.amount);
    if (input.stageId !== undefined) properties.dealstage = input.stageId;
    if (input.closeDate !== undefined) properties.closedate = input.closeDate;

    // Handle custom fields
    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotDeal(response);
  }

  async moveDealStage(id: string, stageId: string): Promise<Deal> {
    const response = await this.request<HubSpotObject>(`/crm/v3/objects/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties: { dealstage: stageId } }),
    });
    return this.mapHubSpotDeal(response);
  }

  async listPipelines(): Promise<Pipeline[]> {
    const response = await this.request<HubSpotPipelinesResponse>('/crm/v3/pipelines/deals');

    return response.results.map((p) => ({
      id: p.id,
      name: p.label,
      stages: p.stages
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((s) => ({
          id: s.id,
          name: s.label,
          order: s.displayOrder,
          probability: s.metadata.probability ? parseFloat(s.metadata.probability) : undefined,
          isClosed: s.metadata.isClosed === 'true',
        })),
    }));
  }

  // ===========================================================================
  // Activities
  // ===========================================================================

  private mapHubSpotActivity(obj: HubSpotObject, type: 'call' | 'email' | 'note'): Activity {
    const props = obj.properties;

    if (type === 'call') {
      return {
        id: obj.id,
        type: 'call',
        subject: props.hs_call_title || '',
        body: props.hs_call_body || undefined,
        durationMinutes: props.hs_call_duration
          ? Math.round(parseInt(props.hs_call_duration, 10) / 1000 / 60)
          : undefined,
        activityDate: props.hs_timestamp || undefined,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      };
    } else if (type === 'email') {
      return {
        id: obj.id,
        type: 'email',
        subject: props.hs_email_subject || '',
        body: props.hs_email_text || undefined,
        activityDate: props.hs_timestamp || undefined,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      };
    } else {
      return {
        id: obj.id,
        type: 'note',
        subject: 'Note',
        body: props.hs_note_body || undefined,
        activityDate: props.hs_timestamp || undefined,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
      };
    }
  }

  async listActivities(
    params?: PaginationParams & { recordId?: string }
  ): Promise<PaginatedResponse<Activity>> {
    // HubSpot has separate endpoints per activity type, so we'll fetch calls by default
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: 'hs_call_title,hs_call_body,hs_call_duration,hs_timestamp',
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(`/crm/v3/objects/calls?${queryParams}`);

    return {
      items: response.results.map((obj) => this.mapHubSpotActivity(obj, 'call')),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async createActivity(input: ActivityCreateInput): Promise<Activity> {
    // Route to appropriate method based on type
    if (input.type === 'call') {
      const contactId = input.contactIds?.[0] || '';
      return this.logCall(contactId, input.subject, input.body);
    } else if (input.type === 'email') {
      const contactId = input.contactIds?.[0] || '';
      return this.logEmail(contactId, input.subject, input.body || '', 'sent');
    } else {
      // Create a note
      const properties: Record<string, string> = {
        hs_note_body: input.body || input.subject,
        hs_timestamp: new Date().toISOString(),
      };

      const response = await this.request<HubSpotObject>('/crm/v3/objects/notes', {
        method: 'POST',
        body: JSON.stringify({ properties }),
      });

      // Associate with contact if provided
      if (input.contactIds && input.contactIds.length > 0) {
        await this.request(
          `/crm/v3/objects/notes/${response.id}/associations/contacts/${input.contactIds[0]}/202`,
          { method: 'PUT' }
        );
      }

      return this.mapHubSpotActivity(response, 'note');
    }
  }

  async logCall(
    contactId: string,
    subject: string,
    notes?: string,
    durationMinutes?: number
  ): Promise<Activity> {
    const properties: Record<string, string> = {
      hs_call_title: subject,
      hs_timestamp: new Date().toISOString(),
    };

    if (notes) properties.hs_call_body = notes;
    if (durationMinutes) properties.hs_call_duration = String(durationMinutes * 60 * 1000); // Convert to milliseconds

    const response = await this.request<HubSpotObject>('/crm/v3/objects/calls', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    // Associate with contact (194 is the association type for call -> contact)
    if (contactId) {
      await this.request(
        `/crm/v3/objects/calls/${response.id}/associations/contacts/${contactId}/194`,
        { method: 'PUT' }
      );
    }

    return this.mapHubSpotActivity(response, 'call');
  }

  async logEmail(
    contactId: string,
    subject: string,
    body: string,
    direction: 'sent' | 'received'
  ): Promise<Activity> {
    const properties: Record<string, string> = {
      hs_email_subject: subject,
      hs_email_text: body,
      hs_email_direction: direction === 'sent' ? 'EMAIL' : 'INCOMING_EMAIL',
      hs_timestamp: new Date().toISOString(),
    };

    const response = await this.request<HubSpotObject>('/crm/v3/objects/emails', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    // Associate with contact (198 is the association type for email -> contact)
    if (contactId) {
      await this.request(
        `/crm/v3/objects/emails/${response.id}/associations/contacts/${contactId}/198`,
        { method: 'PUT' }
      );
    }

    return this.mapHubSpotActivity(response, 'email');
  }

  // ===========================================================================
  // Companies (additional methods)
  // ===========================================================================

  async deleteCompany(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/companies/${id}`, {
      method: 'DELETE',
    });
  }

  async searchCompanies(params: SearchParams): Promise<PaginatedResponse<Company>> {
    const body: Record<string, unknown> = {
      limit: params.limit || 20,
      properties: COMPANY_PROPERTIES.split(','),
    };

    if (params.query) body.query = params.query;
    if (params.cursor) body.after = params.cursor;

    if (params.filters && params.filters.length > 0) {
      body.filterGroups = [
        {
          filters: params.filters.map((f) => ({
            propertyName: f.field,
            operator: this.mapFilterOperator(f.operator),
            value: f.value,
          })),
        },
      ];
    }

    if (params.sortBy) {
      body.sorts = [
        {
          propertyName: params.sortBy,
          direction: params.sortOrder === 'desc' ? 'DESCENDING' : 'ASCENDING',
        },
      ];
    }

    const response = await this.request<HubSpotSearchResponse>('/crm/v3/objects/companies/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      items: response.results.map((obj) => this.mapHubSpotCompany(obj)),
      count: response.results.length,
      total: response.total,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  // ===========================================================================
  // Deals (additional methods)
  // ===========================================================================

  async deleteDeal(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/deals/${id}`, {
      method: 'DELETE',
    });
  }

  async searchDeals(params: SearchParams): Promise<PaginatedResponse<Deal>> {
    const body: Record<string, unknown> = {
      limit: params.limit || 20,
      properties: DEAL_PROPERTIES.split(','),
    };

    if (params.query) body.query = params.query;
    if (params.cursor) body.after = params.cursor;

    if (params.filters && params.filters.length > 0) {
      body.filterGroups = [
        {
          filters: params.filters.map((f) => ({
            propertyName: f.field,
            operator: this.mapFilterOperator(f.operator),
            value: f.value,
          })),
        },
      ];
    }

    if (params.sortBy) {
      body.sorts = [
        {
          propertyName: params.sortBy,
          direction: params.sortOrder === 'desc' ? 'DESCENDING' : 'ASCENDING',
        },
      ];
    }

    const response = await this.request<HubSpotSearchResponse>('/crm/v3/objects/deals/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      items: response.results.map((obj) => this.mapHubSpotDeal(obj)),
      count: response.results.length,
      total: response.total,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  // ===========================================================================
  // Tickets
  // ===========================================================================

  private mapHubSpotTicket(obj: HubSpotObject): Ticket {
    const props = obj.properties;
    return {
      id: obj.id,
      subject: props.subject || '',
      content: props.content || undefined,
      pipelineId: props.hs_pipeline || undefined,
      stageId: props.hs_pipeline_stage || undefined,
      priority: props.hs_ticket_priority || undefined,
      ownerId: props.hubspot_owner_id || undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listTickets(params?: PaginationParams): Promise<PaginatedResponse<Ticket>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: TICKET_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/tickets?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotTicket(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getTicket(id: string): Promise<Ticket> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/tickets/${id}?properties=${TICKET_PROPERTIES}`
    );
    return this.mapHubSpotTicket(response);
  }

  async createTicket(input: TicketCreateInput): Promise<Ticket> {
    const properties: Record<string, string> = {};

    if (input.subject) properties.subject = input.subject;
    if (input.content) properties.content = input.content;
    if (input.pipelineId) properties.hs_pipeline = input.pipelineId;
    if (input.stageId) properties.hs_pipeline_stage = input.stageId;
    if (input.priority) properties.hs_ticket_priority = input.priority;
    if (input.ownerId) properties.hubspot_owner_id = input.ownerId;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>('/crm/v3/objects/tickets', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    // Create associations if contact or company provided
    if (input.contactId) {
      await this.request(
        `/crm/v3/objects/tickets/${response.id}/associations/contacts/${input.contactId}/16`,
        { method: 'PUT' }
      );
    }
    if (input.companyId) {
      await this.request(
        `/crm/v3/objects/tickets/${response.id}/associations/companies/${input.companyId}/26`,
        { method: 'PUT' }
      );
    }

    return this.mapHubSpotTicket(response);
  }

  async updateTicket(id: string, input: TicketUpdateInput): Promise<Ticket> {
    const properties: Record<string, string> = {};

    if (input.subject !== undefined) properties.subject = input.subject;
    if (input.content !== undefined) properties.content = input.content;
    if (input.stageId !== undefined) properties.hs_pipeline_stage = input.stageId;
    if (input.priority !== undefined) properties.hs_ticket_priority = input.priority;
    if (input.ownerId !== undefined) properties.hubspot_owner_id = input.ownerId;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotTicket(response);
  }

  async deleteTicket(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  async searchTickets(params: SearchParams): Promise<PaginatedResponse<Ticket>> {
    const body: Record<string, unknown> = {
      limit: params.limit || 20,
      properties: TICKET_PROPERTIES.split(','),
    };

    if (params.query) body.query = params.query;
    if (params.cursor) body.after = params.cursor;

    if (params.filters && params.filters.length > 0) {
      body.filterGroups = [
        {
          filters: params.filters.map((f) => ({
            propertyName: f.field,
            operator: this.mapFilterOperator(f.operator),
            value: f.value,
          })),
        },
      ];
    }

    if (params.sortBy) {
      body.sorts = [
        {
          propertyName: params.sortBy,
          direction: params.sortOrder === 'desc' ? 'DESCENDING' : 'ASCENDING',
        },
      ];
    }

    const response = await this.request<HubSpotSearchResponse>('/crm/v3/objects/tickets/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      items: response.results.map((obj) => this.mapHubSpotTicket(obj)),
      count: response.results.length,
      total: response.total,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async listTicketPipelines(): Promise<Pipeline[]> {
    const response = await this.request<HubSpotPipelinesResponse>('/crm/v3/pipelines/tickets');

    return response.results.map((p) => ({
      id: p.id,
      name: p.label,
      stages: p.stages
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((s) => ({
          id: s.id,
          name: s.label,
          order: s.displayOrder,
          probability: s.metadata.probability ? parseFloat(s.metadata.probability) : undefined,
          isClosed: s.metadata.isClosed === 'true',
        })),
    }));
  }

  // ===========================================================================
  // Products
  // ===========================================================================

  private mapHubSpotProduct(obj: HubSpotObject): Product {
    const props = obj.properties;
    return {
      id: obj.id,
      name: props.name || '',
      description: props.description || undefined,
      price: props.price ? parseFloat(props.price) : undefined,
      sku: props.hs_sku || undefined,
      recurringBillingPeriod: props.hs_recurring_billing_period || undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listProducts(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: PRODUCT_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/products?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotProduct(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/products/${id}?properties=${PRODUCT_PROPERTIES}`
    );
    return this.mapHubSpotProduct(response);
  }

  async createProduct(input: ProductCreateInput): Promise<Product> {
    const properties: Record<string, string> = {};

    if (input.name) properties.name = input.name;
    if (input.description) properties.description = input.description;
    if (input.price !== undefined) properties.price = String(input.price);
    if (input.sku) properties.hs_sku = input.sku;
    if (input.recurringBillingPeriod) properties.hs_recurring_billing_period = input.recurringBillingPeriod;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>('/crm/v3/objects/products', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotProduct(response);
  }

  async updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
    const properties: Record<string, string> = {};

    if (input.name !== undefined) properties.name = input.name;
    if (input.description !== undefined) properties.description = input.description;
    if (input.price !== undefined) properties.price = String(input.price);
    if (input.sku !== undefined) properties.hs_sku = input.sku;
    if (input.recurringBillingPeriod !== undefined)
      properties.hs_recurring_billing_period = input.recurringBillingPeriod;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotProduct(response);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/products/${id}`, {
      method: 'DELETE',
    });
  }

  async searchProducts(params: SearchParams): Promise<PaginatedResponse<Product>> {
    const body: Record<string, unknown> = {
      limit: params.limit || 20,
      properties: PRODUCT_PROPERTIES.split(','),
    };

    if (params.query) body.query = params.query;
    if (params.cursor) body.after = params.cursor;

    if (params.filters && params.filters.length > 0) {
      body.filterGroups = [
        {
          filters: params.filters.map((f) => ({
            propertyName: f.field,
            operator: this.mapFilterOperator(f.operator),
            value: f.value,
          })),
        },
      ];
    }

    const response = await this.request<HubSpotSearchResponse>('/crm/v3/objects/products/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      items: response.results.map((obj) => this.mapHubSpotProduct(obj)),
      count: response.results.length,
      total: response.total,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  // ===========================================================================
  // Line Items
  // ===========================================================================

  private mapHubSpotLineItem(obj: HubSpotObject): LineItem {
    const props = obj.properties;
    return {
      id: obj.id,
      name: props.name || '',
      quantity: props.quantity ? parseFloat(props.quantity) : undefined,
      price: props.price ? parseFloat(props.price) : undefined,
      amount: props.amount ? parseFloat(props.amount) : undefined,
      discount: props.discount ? parseFloat(props.discount) : undefined,
      productId: props.hs_product_id || undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listLineItems(params?: PaginationParams): Promise<PaginatedResponse<LineItem>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: LINE_ITEM_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/line_items?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotLineItem(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getLineItem(id: string): Promise<LineItem> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/line_items/${id}?properties=${LINE_ITEM_PROPERTIES}`
    );
    return this.mapHubSpotLineItem(response);
  }

  async createLineItem(input: LineItemCreateInput): Promise<LineItem> {
    const properties: Record<string, string> = {};

    if (input.name) properties.name = input.name;
    if (input.quantity !== undefined) properties.quantity = String(input.quantity);
    if (input.price !== undefined) properties.price = String(input.price);
    if (input.discount !== undefined) properties.discount = String(input.discount);
    if (input.productId) properties.hs_product_id = input.productId;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>('/crm/v3/objects/line_items', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    // Associate with deal if provided
    if (input.dealId) {
      await this.request(
        `/crm/v3/objects/line_items/${response.id}/associations/deals/${input.dealId}/20`,
        { method: 'PUT' }
      );
    }

    return this.mapHubSpotLineItem(response);
  }

  async updateLineItem(id: string, input: LineItemUpdateInput): Promise<LineItem> {
    const properties: Record<string, string> = {};

    if (input.name !== undefined) properties.name = input.name;
    if (input.quantity !== undefined) properties.quantity = String(input.quantity);
    if (input.price !== undefined) properties.price = String(input.price);
    if (input.discount !== undefined) properties.discount = String(input.discount);

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/line_items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotLineItem(response);
  }

  async deleteLineItem(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/line_items/${id}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Quotes
  // ===========================================================================

  private mapHubSpotQuote(obj: HubSpotObject): Quote {
    const props = obj.properties;
    return {
      id: obj.id,
      title: props.hs_title || '',
      status: props.hs_status || undefined,
      expirationDate: props.hs_expiration_date || undefined,
      dealId: props.hs_deal_id || undefined,
      totalAmount: props.hs_total ? parseFloat(props.hs_total) : undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listQuotes(params?: PaginationParams): Promise<PaginatedResponse<Quote>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: QUOTE_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/quotes?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotQuote(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getQuote(id: string): Promise<Quote> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/quotes/${id}?properties=${QUOTE_PROPERTIES}`
    );
    return this.mapHubSpotQuote(response);
  }

  async createQuote(input: QuoteCreateInput): Promise<Quote> {
    const properties: Record<string, string> = {};

    if (input.title) properties.hs_title = input.title;
    if (input.expirationDate) properties.hs_expiration_date = input.expirationDate;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>('/crm/v3/objects/quotes', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    // Associate with deal if provided
    if (input.dealId) {
      await this.request(
        `/crm/v3/objects/quotes/${response.id}/associations/deals/${input.dealId}/64`,
        { method: 'PUT' }
      );
    }

    return this.mapHubSpotQuote(response);
  }

  async updateQuote(id: string, input: QuoteUpdateInput): Promise<Quote> {
    const properties: Record<string, string> = {};

    if (input.title !== undefined) properties.hs_title = input.title;
    if (input.expirationDate !== undefined) properties.hs_expiration_date = input.expirationDate;
    if (input.status !== undefined) properties.hs_status = input.status;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/quotes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotQuote(response);
  }

  // ===========================================================================
  // Notes
  // ===========================================================================

  private mapHubSpotNote(obj: HubSpotObject): Note {
    const props = obj.properties;
    return {
      id: obj.id,
      body: props.hs_note_body || '',
      timestamp: props.hs_timestamp || undefined,
      ownerId: props.hubspot_owner_id || undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listNotes(params?: PaginationParams): Promise<PaginatedResponse<Note>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: NOTE_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/notes?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotNote(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getNote(id: string): Promise<Note> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/notes/${id}?properties=${NOTE_PROPERTIES}`
    );
    return this.mapHubSpotNote(response);
  }

  async createNote(input: NoteCreateInput): Promise<Note> {
    const properties: Record<string, string> = {
      hs_note_body: input.body,
      hs_timestamp: input.timestamp || new Date().toISOString(),
    };

    if (input.ownerId) properties.hubspot_owner_id = input.ownerId;

    const response = await this.request<HubSpotObject>('/crm/v3/objects/notes', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    // Create associations
    if (input.contactId) {
      await this.request(
        `/crm/v3/objects/notes/${response.id}/associations/contacts/${input.contactId}/202`,
        { method: 'PUT' }
      );
    }
    if (input.companyId) {
      await this.request(
        `/crm/v3/objects/notes/${response.id}/associations/companies/${input.companyId}/190`,
        { method: 'PUT' }
      );
    }
    if (input.dealId) {
      await this.request(
        `/crm/v3/objects/notes/${response.id}/associations/deals/${input.dealId}/214`,
        { method: 'PUT' }
      );
    }

    return this.mapHubSpotNote(response);
  }

  async updateNote(id: string, input: NoteUpdateInput): Promise<Note> {
    const properties: Record<string, string> = {};

    if (input.body !== undefined) properties.hs_note_body = input.body;
    if (input.timestamp !== undefined) properties.hs_timestamp = input.timestamp;
    if (input.ownerId !== undefined) properties.hubspot_owner_id = input.ownerId;

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotNote(response);
  }

  async deleteNote(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/notes/${id}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Meetings
  // ===========================================================================

  private mapHubSpotMeeting(obj: HubSpotObject): Meeting {
    const props = obj.properties;
    return {
      id: obj.id,
      title: props.hs_meeting_title || '',
      body: props.hs_meeting_body || undefined,
      startTime: props.hs_meeting_start_time || undefined,
      endTime: props.hs_meeting_end_time || undefined,
      outcome: props.hs_meeting_outcome || undefined,
      ownerId: props.hubspot_owner_id || undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listMeetings(params?: PaginationParams): Promise<PaginatedResponse<Meeting>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: MEETING_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/meetings?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotMeeting(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getMeeting(id: string): Promise<Meeting> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/meetings/${id}?properties=${MEETING_PROPERTIES}`
    );
    return this.mapHubSpotMeeting(response);
  }

  async createMeeting(input: MeetingCreateInput): Promise<Meeting> {
    const properties: Record<string, string> = {
      hs_meeting_title: input.title,
      hs_meeting_start_time: input.startTime,
      hs_meeting_end_time: input.endTime,
    };

    if (input.body) properties.hs_meeting_body = input.body;
    if (input.outcome) properties.hs_meeting_outcome = input.outcome;
    if (input.ownerId) properties.hubspot_owner_id = input.ownerId;

    const response = await this.request<HubSpotObject>('/crm/v3/objects/meetings', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    // Associate with contacts
    if (input.contactIds && input.contactIds.length > 0) {
      for (const contactId of input.contactIds) {
        await this.request(
          `/crm/v3/objects/meetings/${response.id}/associations/contacts/${contactId}/200`,
          { method: 'PUT' }
        );
      }
    }

    return this.mapHubSpotMeeting(response);
  }

  async updateMeeting(id: string, input: MeetingUpdateInput): Promise<Meeting> {
    const properties: Record<string, string> = {};

    if (input.title !== undefined) properties.hs_meeting_title = input.title;
    if (input.body !== undefined) properties.hs_meeting_body = input.body;
    if (input.startTime !== undefined) properties.hs_meeting_start_time = input.startTime;
    if (input.endTime !== undefined) properties.hs_meeting_end_time = input.endTime;
    if (input.outcome !== undefined) properties.hs_meeting_outcome = input.outcome;
    if (input.ownerId !== undefined) properties.hubspot_owner_id = input.ownerId;

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/meetings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotMeeting(response);
  }

  async deleteMeeting(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/meetings/${id}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Leads
  // ===========================================================================

  private mapHubSpotLead(obj: HubSpotObject): Lead {
    const props = obj.properties;
    return {
      id: obj.id,
      firstName: props.firstname || undefined,
      lastName: props.lastname || undefined,
      email: props.email || undefined,
      phone: props.phone || undefined,
      company: props.company || undefined,
      status: props.hs_lead_status || props.hs_leadstatus || undefined,
      createdAt: props.createdate || obj.createdAt,
      updatedAt: props.lastmodifieddate || obj.updatedAt,
    };
  }

  async listLeads(params?: PaginationParams): Promise<PaginatedResponse<Lead>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: LEAD_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/leads?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotLead(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getLead(id: string): Promise<Lead> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/leads/${id}?properties=${LEAD_PROPERTIES}`
    );
    return this.mapHubSpotLead(response);
  }

  async createLead(input: LeadCreateInput): Promise<Lead> {
    const properties: Record<string, string> = {};

    if (input.firstName) properties.firstname = input.firstName;
    if (input.lastName) properties.lastname = input.lastName;
    if (input.email) properties.email = input.email;
    if (input.phone) properties.phone = input.phone;
    if (input.company) properties.company = input.company;
    if (input.status) properties.hs_lead_status = input.status;
    if (input.ownerId) properties.hubspot_owner_id = input.ownerId;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>('/crm/v3/objects/leads', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotLead(response);
  }

  async updateLead(id: string, input: LeadUpdateInput): Promise<Lead> {
    const properties: Record<string, string> = {};

    if (input.firstName !== undefined) properties.firstname = input.firstName;
    if (input.lastName !== undefined) properties.lastname = input.lastName;
    if (input.email !== undefined) properties.email = input.email;
    if (input.phone !== undefined) properties.phone = input.phone;
    if (input.company !== undefined) properties.company = input.company;
    if (input.status !== undefined) properties.hs_lead_status = input.status;
    if (input.ownerId !== undefined) properties.hubspot_owner_id = input.ownerId;

    if (input.customFields) {
      for (const [key, value] of Object.entries(input.customFields)) {
        if (value !== undefined && value !== null) {
          properties[key] = String(value);
        }
      }
    }

    const response = await this.request<HubSpotObject>(`/crm/v3/objects/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });

    return this.mapHubSpotLead(response);
  }

  async deleteLead(id: string): Promise<void> {
    await this.request<void>(`/crm/v3/objects/leads/${id}`, {
      method: 'DELETE',
    });
  }

  async searchLeads(params: SearchParams): Promise<PaginatedResponse<Lead>> {
    const body: Record<string, unknown> = {
      limit: params.limit || 20,
      properties: LEAD_PROPERTIES.split(','),
    };

    if (params.query) body.query = params.query;
    if (params.cursor) body.after = params.cursor;

    if (params.filters && params.filters.length > 0) {
      body.filterGroups = [
        {
          filters: params.filters.map((f) => ({
            propertyName: f.field,
            operator: this.mapFilterOperator(f.operator),
            value: f.value,
          })),
        },
      ];
    }

    const response = await this.request<HubSpotSearchResponse>('/crm/v3/objects/leads/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      items: response.results.map((obj) => this.mapHubSpotLead(obj)),
      count: response.results.length,
      total: response.total,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  // ===========================================================================
  // Associations
  // ===========================================================================

  async createAssociation(
    fromObjectType: string,
    fromObjectId: string,
    toObjectType: string,
    toObjectId: string,
    associationTypeId: string
  ): Promise<void> {
    await this.request(
      `/crm/v3/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}/${associationTypeId}`,
      { method: 'PUT' }
    );
  }

  async deleteAssociation(
    fromObjectType: string,
    fromObjectId: string,
    toObjectType: string,
    toObjectId: string,
    associationTypeId: string
  ): Promise<void> {
    await this.request(
      `/crm/v3/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}/${associationTypeId}`,
      { method: 'DELETE' }
    );
  }

  async listAssociations(
    objectType: string,
    objectId: string,
    toObjectType: string
  ): Promise<Association[]> {
    interface AssociationResponse {
      results: Array<{
        id: string;
        type: string;
      }>;
    }

    const response = await this.request<AssociationResponse>(
      `/crm/v3/objects/${objectType}/${objectId}/associations/${toObjectType}`
    );

    return response.results.map((r) => ({
      fromObjectId: objectId,
      fromObjectType: objectType,
      toObjectId: r.id,
      toObjectType: toObjectType,
      associationTypeId: r.type,
    }));
  }

  async getAssociationLabels(fromObjectType: string, toObjectType: string): Promise<AssociationLabel[]> {
    interface LabelResponse {
      results: Array<{
        category: string;
        typeId: number;
        label: string;
      }>;
    }

    const response = await this.request<LabelResponse>(
      `/crm/v4/associations/${fromObjectType}/${toObjectType}/labels`
    );

    return response.results.map((r) => ({
      category: r.category,
      typeId: r.typeId,
      label: r.label,
    }));
  }

  // ===========================================================================
  // Properties
  // ===========================================================================

  async listProperties(objectType: string): Promise<Property[]> {
    interface PropertyResponse {
      results: Array<{
        name: string;
        label: string;
        type: string;
        fieldType: string;
        groupName: string;
        description?: string;
        options?: Array<{
          label: string;
          value: string;
          displayOrder: number;
          hidden: boolean;
        }>;
      }>;
    }

    const response = await this.request<PropertyResponse>(`/crm/v3/properties/${objectType}`);

    return response.results.map((p) => ({
      name: p.name,
      label: p.label,
      type: p.type,
      fieldType: p.fieldType,
      groupName: p.groupName,
      description: p.description,
      options: p.options,
    }));
  }

  async getProperty(objectType: string, propertyName: string): Promise<Property> {
    interface PropertyData {
      name: string;
      label: string;
      type: string;
      fieldType: string;
      groupName: string;
      description?: string;
      options?: Array<{
        label: string;
        value: string;
        displayOrder: number;
        hidden: boolean;
      }>;
    }

    const response = await this.request<PropertyData>(
      `/crm/v3/properties/${objectType}/${propertyName}`
    );

    return {
      name: response.name,
      label: response.label,
      type: response.type,
      fieldType: response.fieldType,
      groupName: response.groupName,
      description: response.description,
      options: response.options,
    };
  }

  async createProperty(objectType: string, input: PropertyCreateInput): Promise<Property> {
    interface PropertyData {
      name: string;
      label: string;
      type: string;
      fieldType: string;
      groupName: string;
      description?: string;
      options?: Array<{
        label: string;
        value: string;
        displayOrder: number;
        hidden: boolean;
      }>;
    }

    const response = await this.request<PropertyData>(`/crm/v3/properties/${objectType}`, {
      method: 'POST',
      body: JSON.stringify(input),
    });

    return {
      name: response.name,
      label: response.label,
      type: response.type,
      fieldType: response.fieldType,
      groupName: response.groupName,
      description: response.description,
      options: response.options,
    };
  }

  async updateProperty(
    objectType: string,
    propertyName: string,
    input: PropertyUpdateInput
  ): Promise<Property> {
    interface PropertyData {
      name: string;
      label: string;
      type: string;
      fieldType: string;
      groupName: string;
      description?: string;
      options?: Array<{
        label: string;
        value: string;
        displayOrder: number;
        hidden: boolean;
      }>;
    }

    const response = await this.request<PropertyData>(
      `/crm/v3/properties/${objectType}/${propertyName}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      }
    );

    return {
      name: response.name,
      label: response.label,
      type: response.type,
      fieldType: response.fieldType,
      groupName: response.groupName,
      description: response.description,
      options: response.options,
    };
  }

  async deleteProperty(objectType: string, propertyName: string): Promise<void> {
    await this.request<void>(`/crm/v3/properties/${objectType}/${propertyName}`, {
      method: 'DELETE',
    });
  }

  async listPropertyGroups(objectType: string): Promise<PropertyGroup[]> {
    interface GroupResponse {
      results: Array<{
        name: string;
        label: string;
        displayOrder: number;
      }>;
    }

    const response = await this.request<GroupResponse>(
      `/crm/v3/properties/${objectType}/groups`
    );

    return response.results.map((g) => ({
      name: g.name,
      label: g.label,
      displayOrder: g.displayOrder,
    }));
  }

  // ===========================================================================
  // Batch Operations
  // ===========================================================================

  private async batchRead<T>(
    objectType: string,
    ids: string[],
    properties: string[],
    mapper: (obj: HubSpotObject) => T
  ): Promise<BatchResult<T>> {
    interface BatchResponse {
      status: string;
      results: HubSpotObject[];
      errors?: Array<{ status: string; message: string }>;
    }

    const response = await this.request<BatchResponse>(
      `/crm/v3/objects/${objectType}/batch/read`,
      {
        method: 'POST',
        body: JSON.stringify({
          inputs: ids.map((id) => ({ id })),
          properties,
        }),
      }
    );

    return {
      status: response.status,
      results: response.results.map(mapper),
      errors: response.errors,
    };
  }

  private async batchCreate<I, T>(
    objectType: string,
    inputs: I[],
    propertyMapper: (input: I) => Record<string, string>,
    resultMapper: (obj: HubSpotObject) => T
  ): Promise<BatchResult<T>> {
    interface BatchResponse {
      status: string;
      results: HubSpotObject[];
      errors?: Array<{ status: string; message: string }>;
    }

    const response = await this.request<BatchResponse>(
      `/crm/v3/objects/${objectType}/batch/create`,
      {
        method: 'POST',
        body: JSON.stringify({
          inputs: inputs.map((input) => ({ properties: propertyMapper(input) })),
        }),
      }
    );

    return {
      status: response.status,
      results: response.results.map(resultMapper),
      errors: response.errors,
    };
  }

  private async batchUpdate<I, T>(
    objectType: string,
    inputs: Array<{ id: string } & I>,
    propertyMapper: (input: I) => Record<string, string>,
    resultMapper: (obj: HubSpotObject) => T
  ): Promise<BatchResult<T>> {
    interface BatchResponse {
      status: string;
      results: HubSpotObject[];
      errors?: Array<{ status: string; message: string }>;
    }

    const response = await this.request<BatchResponse>(
      `/crm/v3/objects/${objectType}/batch/update`,
      {
        method: 'POST',
        body: JSON.stringify({
          inputs: inputs.map(({ id, ...rest }) => ({
            id,
            properties: propertyMapper(rest as I),
          })),
        }),
      }
    );

    return {
      status: response.status,
      results: response.results.map(resultMapper),
      errors: response.errors,
    };
  }

  private async batchArchive(objectType: string, ids: string[]): Promise<void> {
    await this.request(`/crm/v3/objects/${objectType}/batch/archive`, {
      method: 'POST',
      body: JSON.stringify({
        inputs: ids.map((id) => ({ id })),
      }),
    });
  }

  // Contact batch operations
  async batchReadContacts(ids: string[], properties?: string[]): Promise<BatchResult<Contact>> {
    return this.batchRead(
      'contacts',
      ids,
      properties || CONTACT_PROPERTIES.split(','),
      this.mapHubSpotContact.bind(this)
    );
  }

  async batchCreateContacts(inputs: ContactCreateInput[]): Promise<BatchResult<Contact>> {
    return this.batchCreate(
      'contacts',
      inputs,
      (input) => {
        const props: Record<string, string> = {};
        if (input.firstName) props.firstname = input.firstName;
        if (input.lastName) props.lastname = input.lastName;
        if (input.email) props.email = input.email;
        if (input.phone) props.phone = input.phone;
        if (input.title) props.jobtitle = input.title;
        return props;
      },
      this.mapHubSpotContact.bind(this)
    );
  }

  async batchUpdateContacts(
    inputs: Array<{ id: string } & ContactUpdateInput>
  ): Promise<BatchResult<Contact>> {
    return this.batchUpdate(
      'contacts',
      inputs,
      (input) => {
        const props: Record<string, string> = {};
        if (input.firstName !== undefined) props.firstname = input.firstName;
        if (input.lastName !== undefined) props.lastname = input.lastName;
        if (input.email !== undefined) props.email = input.email;
        if (input.phone !== undefined) props.phone = input.phone;
        if (input.title !== undefined) props.jobtitle = input.title;
        return props;
      },
      this.mapHubSpotContact.bind(this)
    );
  }

  async batchArchiveContacts(ids: string[]): Promise<void> {
    return this.batchArchive('contacts', ids);
  }

  // Company batch operations
  async batchReadCompanies(ids: string[], properties?: string[]): Promise<BatchResult<Company>> {
    return this.batchRead(
      'companies',
      ids,
      properties || COMPANY_PROPERTIES.split(','),
      this.mapHubSpotCompany.bind(this)
    );
  }

  async batchCreateCompanies(inputs: CompanyCreateInput[]): Promise<BatchResult<Company>> {
    return this.batchCreate(
      'companies',
      inputs,
      (input) => {
        const props: Record<string, string> = {};
        if (input.name) props.name = input.name;
        if (input.domain) props.domain = input.domain;
        if (input.industry) props.industry = input.industry;
        if (input.description) props.description = input.description;
        if (input.numberOfEmployees !== undefined)
          props.numberofemployees = String(input.numberOfEmployees);
        return props;
      },
      this.mapHubSpotCompany.bind(this)
    );
  }

  async batchUpdateCompanies(
    inputs: Array<{ id: string } & CompanyUpdateInput>
  ): Promise<BatchResult<Company>> {
    return this.batchUpdate(
      'companies',
      inputs,
      (input) => {
        const props: Record<string, string> = {};
        if (input.name !== undefined) props.name = input.name;
        if (input.domain !== undefined) props.domain = input.domain;
        if (input.industry !== undefined) props.industry = input.industry;
        if (input.description !== undefined) props.description = input.description;
        if (input.numberOfEmployees !== undefined)
          props.numberofemployees = String(input.numberOfEmployees);
        return props;
      },
      this.mapHubSpotCompany.bind(this)
    );
  }

  async batchArchiveCompanies(ids: string[]): Promise<void> {
    return this.batchArchive('companies', ids);
  }

  // Deal batch operations
  async batchReadDeals(ids: string[], properties?: string[]): Promise<BatchResult<Deal>> {
    return this.batchRead(
      'deals',
      ids,
      properties || DEAL_PROPERTIES.split(','),
      this.mapHubSpotDeal.bind(this)
    );
  }

  async batchCreateDeals(inputs: DealCreateInput[]): Promise<BatchResult<Deal>> {
    return this.batchCreate(
      'deals',
      inputs,
      (input) => {
        const props: Record<string, string> = {};
        if (input.name) props.dealname = input.name;
        if (input.amount !== undefined) props.amount = String(input.amount);
        if (input.stageId) props.dealstage = input.stageId;
        if (input.pipelineId) props.pipeline = input.pipelineId;
        if (input.closeDate) props.closedate = input.closeDate;
        return props;
      },
      this.mapHubSpotDeal.bind(this)
    );
  }

  async batchUpdateDeals(
    inputs: Array<{ id: string } & DealUpdateInput>
  ): Promise<BatchResult<Deal>> {
    return this.batchUpdate(
      'deals',
      inputs,
      (input) => {
        const props: Record<string, string> = {};
        if (input.name !== undefined) props.dealname = input.name;
        if (input.amount !== undefined) props.amount = String(input.amount);
        if (input.stageId !== undefined) props.dealstage = input.stageId;
        if (input.closeDate !== undefined) props.closedate = input.closeDate;
        return props;
      },
      this.mapHubSpotDeal.bind(this)
    );
  }

  async batchArchiveDeals(ids: string[]): Promise<void> {
    return this.batchArchive('deals', ids);
  }

  // Ticket batch operations
  async batchReadTickets(ids: string[], properties?: string[]): Promise<BatchResult<Ticket>> {
    return this.batchRead(
      'tickets',
      ids,
      properties || TICKET_PROPERTIES.split(','),
      this.mapHubSpotTicket.bind(this)
    );
  }

  async batchCreateTickets(inputs: TicketCreateInput[]): Promise<BatchResult<Ticket>> {
    return this.batchCreate(
      'tickets',
      inputs,
      (input) => {
        const props: Record<string, string> = {};
        if (input.subject) props.subject = input.subject;
        if (input.content) props.content = input.content;
        if (input.pipelineId) props.hs_pipeline = input.pipelineId;
        if (input.stageId) props.hs_pipeline_stage = input.stageId;
        if (input.priority) props.hs_ticket_priority = input.priority;
        return props;
      },
      this.mapHubSpotTicket.bind(this)
    );
  }

  async batchUpdateTickets(
    inputs: Array<{ id: string } & TicketUpdateInput>
  ): Promise<BatchResult<Ticket>> {
    return this.batchUpdate(
      'tickets',
      inputs,
      (input) => {
        const props: Record<string, string> = {};
        if (input.subject !== undefined) props.subject = input.subject;
        if (input.content !== undefined) props.content = input.content;
        if (input.stageId !== undefined) props.hs_pipeline_stage = input.stageId;
        if (input.priority !== undefined) props.hs_ticket_priority = input.priority;
        return props;
      },
      this.mapHubSpotTicket.bind(this)
    );
  }

  async batchArchiveTickets(ids: string[]): Promise<void> {
    return this.batchArchive('tickets', ids);
  }

  // ===========================================================================
  // Owners
  // ===========================================================================

  async listOwners(): Promise<Owner[]> {
    interface OwnerResponse {
      results: Array<{
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        userId?: number;
        createdAt: string;
        updatedAt: string;
      }>;
    }

    const response = await this.request<OwnerResponse>('/crm/v3/owners');

    return response.results.map((o) => ({
      id: o.id,
      email: o.email,
      firstName: o.firstName,
      lastName: o.lastName,
      userId: o.userId,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));
  }

  async getOwner(id: string): Promise<Owner> {
    interface OwnerData {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      userId?: number;
      createdAt: string;
      updatedAt: string;
    }

    const response = await this.request<OwnerData>(`/crm/v3/owners/${id}`);

    return {
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      userId: response.userId,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  }

  // ===========================================================================
  // Extended Pipelines
  // ===========================================================================

  async getPipeline(objectType: string, pipelineId: string): Promise<Pipeline> {
    const response = await this.request<HubSpotPipeline>(
      `/crm/v3/pipelines/${objectType}/${pipelineId}`
    );

    return {
      id: response.id,
      name: response.label,
      stages: response.stages
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((s) => ({
          id: s.id,
          name: s.label,
          order: s.displayOrder,
          probability: s.metadata.probability ? parseFloat(s.metadata.probability) : undefined,
          isClosed: s.metadata.isClosed === 'true',
        })),
    };
  }

  async createPipeline(objectType: string, input: PipelineCreateInput): Promise<Pipeline> {
    const body = {
      label: input.label,
      displayOrder: input.displayOrder || 0,
      stages: input.stages.map((s) => ({
        label: s.label,
        displayOrder: s.displayOrder,
        metadata: {
          probability: s.metadata?.probability?.toString() || '0',
          isClosed: s.metadata?.isClosed?.toString() || 'false',
        },
      })),
    };

    const response = await this.request<HubSpotPipeline>(`/crm/v3/pipelines/${objectType}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return {
      id: response.id,
      name: response.label,
      stages: response.stages
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((s) => ({
          id: s.id,
          name: s.label,
          order: s.displayOrder,
          probability: s.metadata.probability ? parseFloat(s.metadata.probability) : undefined,
          isClosed: s.metadata.isClosed === 'true',
        })),
    };
  }

  async updatePipeline(
    objectType: string,
    pipelineId: string,
    input: PipelineUpdateInput
  ): Promise<Pipeline> {
    const body: Record<string, unknown> = {};
    if (input.label !== undefined) body.label = input.label;
    if (input.displayOrder !== undefined) body.displayOrder = input.displayOrder;

    const response = await this.request<HubSpotPipeline>(
      `/crm/v3/pipelines/${objectType}/${pipelineId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );

    return {
      id: response.id,
      name: response.label,
      stages: response.stages
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((s) => ({
          id: s.id,
          name: s.label,
          order: s.displayOrder,
          probability: s.metadata.probability ? parseFloat(s.metadata.probability) : undefined,
          isClosed: s.metadata.isClosed === 'true',
        })),
    };
  }

  async deletePipeline(objectType: string, pipelineId: string): Promise<void> {
    await this.request<void>(`/crm/v3/pipelines/${objectType}/${pipelineId}`, {
      method: 'DELETE',
    });
  }

  async getPipelineStage(
    objectType: string,
    pipelineId: string,
    stageId: string
  ): Promise<PipelineStage> {
    const response = await this.request<HubSpotPipelineStage>(
      `/crm/v3/pipelines/${objectType}/${pipelineId}/stages/${stageId}`
    );

    return {
      id: response.id,
      name: response.label,
      order: response.displayOrder,
      probability: response.metadata.probability
        ? parseFloat(response.metadata.probability)
        : undefined,
      isClosed: response.metadata.isClosed === 'true',
    };
  }

  async createPipelineStage(
    objectType: string,
    pipelineId: string,
    input: PipelineStageInput
  ): Promise<PipelineStage> {
    const body = {
      label: input.label,
      displayOrder: input.displayOrder,
      metadata: {
        probability: input.metadata?.probability?.toString() || '0',
        isClosed: input.metadata?.isClosed?.toString() || 'false',
      },
    };

    const response = await this.request<HubSpotPipelineStage>(
      `/crm/v3/pipelines/${objectType}/${pipelineId}/stages`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    return {
      id: response.id,
      name: response.label,
      order: response.displayOrder,
      probability: response.metadata.probability
        ? parseFloat(response.metadata.probability)
        : undefined,
      isClosed: response.metadata.isClosed === 'true',
    };
  }

  async updatePipelineStage(
    objectType: string,
    pipelineId: string,
    stageId: string,
    input: PipelineStageUpdateInput
  ): Promise<PipelineStage> {
    const body: Record<string, unknown> = {};
    if (input.label !== undefined) body.label = input.label;
    if (input.displayOrder !== undefined) body.displayOrder = input.displayOrder;
    if (input.metadata) {
      body.metadata = {
        probability: input.metadata.probability?.toString(),
        isClosed: input.metadata.isClosed?.toString(),
      };
    }

    const response = await this.request<HubSpotPipelineStage>(
      `/crm/v3/pipelines/${objectType}/${pipelineId}/stages/${stageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      }
    );

    return {
      id: response.id,
      name: response.label,
      order: response.displayOrder,
      probability: response.metadata.probability
        ? parseFloat(response.metadata.probability)
        : undefined,
      isClosed: response.metadata.isClosed === 'true',
    };
  }

  async deletePipelineStage(
    objectType: string,
    pipelineId: string,
    stageId: string
  ): Promise<void> {
    await this.request<void>(
      `/crm/v3/pipelines/${objectType}/${pipelineId}/stages/${stageId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async listWebhookSubscriptions(appId: string): Promise<WebhookSubscription[]> {
    interface SubscriptionResponse {
      results: Array<{
        id: string;
        propertyName?: string;
        active: boolean;
        subscriptionType: string;
      }>;
    }

    const response = await this.request<SubscriptionResponse>(
      `/webhooks/v3/${appId}/subscriptions`
    );

    return response.results.map((s) => ({
      id: s.id,
      propertyName: s.propertyName,
      active: s.active,
      subscriptionType: s.subscriptionType,
    }));
  }

  // ===========================================================================
  // Commerce Objects
  // ===========================================================================

  private mapHubSpotInvoice(obj: HubSpotObject): Invoice {
    const props = obj.properties;
    return {
      id: obj.id,
      invoiceNumber: props.hs_number || undefined,
      status: props.hs_status || undefined,
      dueDate: props.hs_due_date || undefined,
      totalAmount: props.hs_amount_billed ? parseFloat(props.hs_amount_billed) : undefined,
      currency: props.hs_currency || undefined,
      createdAt: props.createdate || obj.createdAt,
    };
  }

  async listInvoices(params?: PaginationParams): Promise<PaginatedResponse<Invoice>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: INVOICE_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/invoices?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotInvoice(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/invoices/${id}?properties=${INVOICE_PROPERTIES}`
    );
    return this.mapHubSpotInvoice(response);
  }

  private mapHubSpotOrder(obj: HubSpotObject): Order {
    const props = obj.properties;
    return {
      id: obj.id,
      orderNumber: props.hs_order_name || props.hs_external_order_id || undefined,
      status: props.hs_fulfillment_status || undefined,
      totalAmount: props.hs_total_price ? parseFloat(props.hs_total_price) : undefined,
      createdAt: props.createdate || obj.createdAt,
    };
  }

  async listOrders(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 20),
      properties: ORDER_PROPERTIES,
    });
    if (params?.cursor) queryParams.set('after', params.cursor);

    const response = await this.request<HubSpotListResponse>(
      `/crm/v3/objects/orders?${queryParams}`
    );

    return {
      items: response.results.map((obj) => this.mapHubSpotOrder(obj)),
      count: response.results.length,
      hasMore: !!response.paging?.next?.after,
      nextCursor: response.paging?.next?.after,
    };
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.request<HubSpotObject>(
      `/crm/v3/objects/orders/${id}?properties=${ORDER_PROPERTIES}`
    );
    return this.mapHubSpotOrder(response);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a CRM client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createCrmClient(credentials: TenantCredentials): CrmClient {
  return new CrmClientImpl(credentials);
}
