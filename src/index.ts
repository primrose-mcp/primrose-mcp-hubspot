/**
 * CRM MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports both stateless (McpServer) and stateful (McpAgent) modes.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (API keys, etc.) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-CRM-API-Key: API key for CRM authentication
 *
 * Optional Headers:
 * - X-CRM-Base-URL: Override the default CRM API base URL
 * - X-CRM-Access-Token: OAuth access token (alternative to API key)
 *
 * CUSTOMIZE: Update the server name, version, and register your tools.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createCrmClient } from './client.js';
import { registerActivityTools } from './tools/activities.js';
import { registerAssociationTools } from './tools/associations.js';
import { registerBatchTools } from './tools/batch.js';
import { registerCommerceTools } from './tools/commerce.js';
import { registerCompanyTools } from './tools/companies.js';
import { registerContactTools } from './tools/contacts.js';
import { registerDealTools } from './tools/deals.js';
import { registerLeadTools } from './tools/leads.js';
import { registerLineItemTools } from './tools/line_items.js';
import { registerMeetingTools } from './tools/meetings.js';
import { registerNoteTools } from './tools/notes.js';
import { registerOwnerTools } from './tools/owners.js';
import { registerPipelineTools } from './tools/pipelines.js';
import { registerProductTools } from './tools/products.js';
import { registerPropertyTools } from './tools/properties.js';
import { registerQuoteTools } from './tools/quotes.js';
import { registerTicketTools } from './tools/tickets.js';
import { registerWebhookTools } from './tools/webhooks.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

/**
 * CUSTOMIZE: Update these values for your CRM
 */
const SERVER_NAME = 'primrose-mcp-hubspot';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 *
 * Use this when you need:
 * - Session state persistence
 * - Per-user rate limiting
 * - Cached API responses
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class CrmMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    // NOTE: Stateful mode requires credentials to be configured differently.
    // For multi-tenant, use the stateless endpoint at /mcp instead.
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-CRM-API-Key header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createCrmClient(credentials);

  // Core CRM objects
  registerContactTools(server, client);
  registerCompanyTools(server, client);
  registerDealTools(server, client);
  registerTicketTools(server, client);
  registerLeadTools(server, client);

  // Products & Commerce
  registerProductTools(server, client);
  registerLineItemTools(server, client);
  registerQuoteTools(server, client);
  registerCommerceTools(server, client);

  // Activities & Engagement
  registerActivityTools(server, client);
  registerNoteTools(server, client);
  registerMeetingTools(server, client);

  // Configuration & Management
  registerAssociationTools(server, client);
  registerPropertyTools(server, client);
  registerPipelineTools(server, client);
  registerOwnerTools(server, client);
  registerBatchTools(server, client);
  registerWebhookTools(server, client);

  server.tool('hubspot_test_connection', 'Test the connection to the HubSpot API', {}, async () => {
    try {
      const result = await client.testConnection();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Option 1: Stateful MCP with McpAgent (requires Durable Objects)
    // ==========================================================================
    // Uncomment to use McpAgent for stateful sessions:
    //
    // if (url.pathname === '/sse' || url.pathname === '/mcp') {
    //   return CrmMcpAgent.serveSSE('/sse').fetch(request, env, ctx);
    // }

    // ==========================================================================
    // Option 2: Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-CRM-API-Key or X-CRM-Access-Token'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      // This is the recommended approach for stateless MCP servers
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      // For SSE, we need to use McpAgent with serveSSE
      // Enable Durable Objects in wrangler.jsonc to use this
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant CRM MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-CRM-API-Key': 'API key for CRM authentication (or use X-CRM-Access-Token)',
          },
          optional_headers: {
            'X-CRM-Access-Token': 'OAuth access token (alternative to API key)',
            'X-CRM-Base-URL': 'Override the default CRM API base URL',
            'X-CRM-Client-ID': 'OAuth client ID',
            'X-CRM-Client-Secret': 'OAuth client secret',
          },
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
