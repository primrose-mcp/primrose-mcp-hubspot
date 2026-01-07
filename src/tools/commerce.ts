/**
 * Commerce Tools
 *
 * MCP tools for HubSpot commerce objects (invoices, orders).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerCommerceTools(server: McpServer, client: CrmClient): void {
  // Invoice tools
  server.tool(
    'hubspot_list_invoices',
    `List invoices from HubSpot with pagination.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of invoices to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listInvoices({ limit, cursor });
        return formatResponse(result, format, 'invoices');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_invoice',
    `Get a single invoice by ID.`,
    {
      id: z.string().describe('Invoice ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const invoice = await client.getInvoice(id);
        return formatResponse(invoice, format, 'invoice');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Order tools
  server.tool(
    'hubspot_list_orders',
    `List orders from HubSpot with pagination.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of orders to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listOrders({ limit, cursor });
        return formatResponse(result, format, 'orders');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_order',
    `Get a single order by ID.`,
    {
      id: z.string().describe('Order ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const order = await client.getOrder(id);
        return formatResponse(order, format, 'order');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
