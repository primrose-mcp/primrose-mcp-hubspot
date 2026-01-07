/**
 * Batch Operation Tools
 *
 * MCP tools for batch operations on HubSpot objects.
 * Max 100 records per batch request.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerBatchTools(server: McpServer, client: CrmClient): void {
  // Contact batch operations
  server.tool(
    'hubspot_batch_read_contacts',
    `Read multiple contacts by ID in a single request (max 100).`,
    {
      ids: z.array(z.string()).max(100).describe('Array of contact IDs'),
      properties: z.array(z.string()).optional().describe('Properties to fetch'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ ids, properties, format }) => {
      try {
        const result = await client.batchReadContacts(ids, properties);
        return formatResponse(result, format, 'batch_result');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_create_contacts',
    `Create multiple contacts in a single request (max 100).`,
    {
      contacts: z.array(z.object({
        email: z.string(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
      })).max(100).describe('Array of contact data'),
    },
    async ({ contacts }) => {
      try {
        const result = await client.batchCreateContacts(contacts);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Created ${result.results.length} contacts`,
                result,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_update_contacts',
    `Update multiple contacts in a single request (max 100).`,
    {
      contacts: z.array(z.object({
        id: z.string(),
        email: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
      })).max(100).describe('Array of contact updates with IDs'),
    },
    async ({ contacts }) => {
      try {
        const result = await client.batchUpdateContacts(contacts);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Updated ${result.results.length} contacts`,
                result,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_archive_contacts',
    `Archive (delete) multiple contacts in a single request (max 100).`,
    {
      ids: z.array(z.string()).max(100).describe('Array of contact IDs to archive'),
    },
    async ({ ids }) => {
      try {
        await client.batchArchiveContacts(ids);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Archived ${ids.length} contacts`,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Company batch operations
  server.tool(
    'hubspot_batch_read_companies',
    `Read multiple companies by ID in a single request (max 100).`,
    {
      ids: z.array(z.string()).max(100).describe('Array of company IDs'),
      properties: z.array(z.string()).optional().describe('Properties to fetch'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ ids, properties, format }) => {
      try {
        const result = await client.batchReadCompanies(ids, properties);
        return formatResponse(result, format, 'batch_result');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_create_companies',
    `Create multiple companies in a single request (max 100).`,
    {
      companies: z.array(z.object({
        name: z.string(),
        domain: z.string().optional(),
        industry: z.string().optional(),
        description: z.string().optional(),
        numberOfEmployees: z.number().optional(),
      })).max(100).describe('Array of company data'),
    },
    async ({ companies }) => {
      try {
        const result = await client.batchCreateCompanies(companies);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Created ${result.results.length} companies`,
                result,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_archive_companies',
    `Archive (delete) multiple companies in a single request (max 100).`,
    {
      ids: z.array(z.string()).max(100).describe('Array of company IDs to archive'),
    },
    async ({ ids }) => {
      try {
        await client.batchArchiveCompanies(ids);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Archived ${ids.length} companies`,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Deal batch operations
  server.tool(
    'hubspot_batch_read_deals',
    `Read multiple deals by ID in a single request (max 100).`,
    {
      ids: z.array(z.string()).max(100).describe('Array of deal IDs'),
      properties: z.array(z.string()).optional().describe('Properties to fetch'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ ids, properties, format }) => {
      try {
        const result = await client.batchReadDeals(ids, properties);
        return formatResponse(result, format, 'batch_result');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_create_deals',
    `Create multiple deals in a single request (max 100).`,
    {
      deals: z.array(z.object({
        name: z.string(),
        amount: z.number().optional(),
        stageId: z.string().optional(),
        pipelineId: z.string().optional(),
        closeDate: z.string().optional(),
      })).max(100).describe('Array of deal data'),
    },
    async ({ deals }) => {
      try {
        const result = await client.batchCreateDeals(deals);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Created ${result.results.length} deals`,
                result,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_archive_deals',
    `Archive (delete) multiple deals in a single request (max 100).`,
    {
      ids: z.array(z.string()).max(100).describe('Array of deal IDs to archive'),
    },
    async ({ ids }) => {
      try {
        await client.batchArchiveDeals(ids);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Archived ${ids.length} deals`,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Ticket batch operations
  server.tool(
    'hubspot_batch_read_tickets',
    `Read multiple tickets by ID in a single request (max 100).`,
    {
      ids: z.array(z.string()).max(100).describe('Array of ticket IDs'),
      properties: z.array(z.string()).optional().describe('Properties to fetch'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ ids, properties, format }) => {
      try {
        const result = await client.batchReadTickets(ids, properties);
        return formatResponse(result, format, 'batch_result');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_create_tickets',
    `Create multiple tickets in a single request (max 100).`,
    {
      tickets: z.array(z.object({
        subject: z.string(),
        content: z.string().optional(),
        pipelineId: z.string().optional(),
        stageId: z.string().optional(),
        priority: z.string().optional(),
      })).max(100).describe('Array of ticket data'),
    },
    async ({ tickets }) => {
      try {
        const result = await client.batchCreateTickets(tickets);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Created ${result.results.length} tickets`,
                result,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_batch_archive_tickets',
    `Archive (delete) multiple tickets in a single request (max 100).`,
    {
      ids: z.array(z.string()).max(100).describe('Array of ticket IDs to archive'),
    },
    async ({ ids }) => {
      try {
        await client.batchArchiveTickets(ids);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Archived ${ids.length} tickets`,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
