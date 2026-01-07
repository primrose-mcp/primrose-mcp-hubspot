/**
 * Quote Tools
 *
 * MCP tools for quote management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerQuoteTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_quotes',
    `List quotes from HubSpot with pagination.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of quotes to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listQuotes({ limit, cursor });
        return formatResponse(result, format, 'quotes');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_quote',
    `Get a single quote by ID.`,
    {
      id: z.string().describe('Quote ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const quote = await client.getQuote(id);
        return formatResponse(quote, format, 'quote');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_quote',
    `Create a new quote in HubSpot.`,
    {
      title: z.string().describe('Quote title (required)'),
      expirationDate: z.string().optional().describe('Expiration date (ISO 8601)'),
      dealId: z.string().optional().describe('Deal ID to associate'),
    },
    async (input) => {
      try {
        const quote = await client.createQuote(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Quote created', quote }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_quote',
    `Update an existing quote.`,
    {
      id: z.string().describe('Quote ID to update'),
      title: z.string().optional(),
      expirationDate: z.string().optional(),
      status: z.string().optional().describe('Quote status'),
    },
    async ({ id, ...input }) => {
      try {
        const quote = await client.updateQuote(id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Quote updated', quote }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
