/**
 * Lead Tools
 *
 * MCP tools for lead management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerLeadTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_leads',
    `List leads from HubSpot with pagination.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of leads to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listLeads({ limit, cursor });
        return formatResponse(result, format, 'leads');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_lead',
    `Get a single lead by ID.`,
    {
      id: z.string().describe('Lead ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const lead = await client.getLead(id);
        return formatResponse(lead, format, 'lead');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_lead',
    `Create a new lead in HubSpot.`,
    {
      firstName: z.string().optional().describe('First name'),
      lastName: z.string().optional().describe('Last name'),
      email: z.string().optional().describe('Email address'),
      phone: z.string().optional().describe('Phone number'),
      company: z.string().optional().describe('Company name'),
      status: z.string().optional().describe('Lead status'),
      ownerId: z.string().optional().describe('Owner ID'),
    },
    async (input) => {
      try {
        const lead = await client.createLead(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Lead created', lead }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_lead',
    `Update an existing lead.`,
    {
      id: z.string().describe('Lead ID to update'),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      status: z.string().optional(),
      ownerId: z.string().optional(),
    },
    async ({ id, ...input }) => {
      try {
        const lead = await client.updateLead(id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Lead updated', lead }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_lead',
    `Delete a lead from HubSpot.`,
    {
      id: z.string().describe('Lead ID to delete'),
    },
    async ({ id }) => {
      try {
        await client.deleteLead(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Lead ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_search_leads',
    `Search for leads matching criteria.`,
    {
      query: z.string().describe('Search query'),
      limit: z.number().int().min(1).max(100).default(20),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, limit, format }) => {
      try {
        const result = await client.searchLeads({ query, limit });
        return formatResponse(result, format, 'leads');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
