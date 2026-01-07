/**
 * Line Item Tools
 *
 * MCP tools for line item management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerLineItemTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_line_items',
    `List line items from HubSpot with pagination.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of line items to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listLineItems({ limit, cursor });
        return formatResponse(result, format, 'line_items');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_line_item',
    `Get a single line item by ID.`,
    {
      id: z.string().describe('Line item ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const lineItem = await client.getLineItem(id);
        return formatResponse(lineItem, format, 'line_item');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_line_item',
    `Create a new line item in HubSpot.`,
    {
      name: z.string().describe('Line item name (required)'),
      quantity: z.number().optional().describe('Quantity'),
      price: z.number().optional().describe('Unit price'),
      discount: z.number().optional().describe('Discount amount'),
      productId: z.string().optional().describe('Associated product ID'),
      dealId: z.string().optional().describe('Deal ID to associate'),
    },
    async (input) => {
      try {
        const lineItem = await client.createLineItem(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Line item created', lineItem }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_line_item',
    `Update an existing line item.`,
    {
      id: z.string().describe('Line item ID to update'),
      name: z.string().optional(),
      quantity: z.number().optional(),
      price: z.number().optional(),
      discount: z.number().optional(),
    },
    async ({ id, ...input }) => {
      try {
        const lineItem = await client.updateLineItem(id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Line item updated', lineItem }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_line_item',
    `Delete a line item from HubSpot.`,
    {
      id: z.string().describe('Line item ID to delete'),
    },
    async ({ id }) => {
      try {
        await client.deleteLineItem(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Line item ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
