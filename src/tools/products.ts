/**
 * Product Tools
 *
 * MCP tools for product management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerProductTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_products',
    `List products from HubSpot with pagination.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of products to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listProducts({ limit, cursor });
        return formatResponse(result, format, 'products');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_product',
    `Get a single product by ID.`,
    {
      id: z.string().describe('Product ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const product = await client.getProduct(id);
        return formatResponse(product, format, 'product');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_product',
    `Create a new product in HubSpot.`,
    {
      name: z.string().describe('Product name (required)'),
      description: z.string().optional().describe('Product description'),
      price: z.number().optional().describe('Product price'),
      sku: z.string().optional().describe('Product SKU'),
      recurringBillingPeriod: z.string().optional().describe('Billing period (monthly, yearly, etc.)'),
    },
    async (input) => {
      try {
        const product = await client.createProduct(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Product created', product }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_product',
    `Update an existing product.`,
    {
      id: z.string().describe('Product ID to update'),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      sku: z.string().optional(),
      recurringBillingPeriod: z.string().optional(),
    },
    async ({ id, ...input }) => {
      try {
        const product = await client.updateProduct(id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Product updated', product }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_product',
    `Delete a product from HubSpot.`,
    {
      id: z.string().describe('Product ID to delete'),
    },
    async ({ id }) => {
      try {
        await client.deleteProduct(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Product ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_search_products',
    `Search for products matching criteria.`,
    {
      query: z.string().describe('Search query'),
      limit: z.number().int().min(1).max(100).default(20),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, limit, format }) => {
      try {
        const result = await client.searchProducts({ query, limit });
        return formatResponse(result, format, 'products');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
