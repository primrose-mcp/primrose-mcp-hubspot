/**
 * Ticket Tools
 *
 * MCP tools for ticket management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerTicketTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_tickets',
    `List tickets from HubSpot with pagination.

Returns a paginated list of tickets. Use the cursor from the response to fetch the next page.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of tickets to return'),
      cursor: z.string().optional().describe('Pagination cursor from previous response'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listTickets({ limit, cursor });
        return formatResponse(result, format, 'tickets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_ticket',
    `Get a single ticket by ID.`,
    {
      id: z.string().describe('Ticket ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const ticket = await client.getTicket(id);
        return formatResponse(ticket, format, 'ticket');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_ticket',
    `Create a new ticket in HubSpot.`,
    {
      subject: z.string().describe('Ticket subject (required)'),
      content: z.string().optional().describe('Ticket content/description'),
      pipelineId: z.string().optional().describe('Pipeline ID'),
      stageId: z.string().optional().describe('Stage ID within the pipeline'),
      priority: z.string().optional().describe('Ticket priority (HIGH, MEDIUM, LOW)'),
      contactId: z.string().optional().describe('Contact ID to associate'),
      companyId: z.string().optional().describe('Company ID to associate'),
      ownerId: z.string().optional().describe('Owner ID'),
    },
    async (input) => {
      try {
        const ticket = await client.createTicket(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Ticket created', ticket }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_ticket',
    `Update an existing ticket.`,
    {
      id: z.string().describe('Ticket ID to update'),
      subject: z.string().optional().describe('New subject'),
      content: z.string().optional().describe('New content'),
      stageId: z.string().optional().describe('New stage ID'),
      priority: z.string().optional().describe('New priority'),
      ownerId: z.string().optional().describe('New owner ID'),
    },
    async ({ id, ...input }) => {
      try {
        const ticket = await client.updateTicket(id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Ticket updated', ticket }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_ticket',
    `Delete a ticket from HubSpot.`,
    {
      id: z.string().describe('Ticket ID to delete'),
    },
    async ({ id }) => {
      try {
        await client.deleteTicket(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Ticket ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_search_tickets',
    `Search for tickets matching criteria.`,
    {
      query: z.string().describe('Search query'),
      limit: z.number().int().min(1).max(100).default(20),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, limit, format }) => {
      try {
        const result = await client.searchTickets({ query, limit });
        return formatResponse(result, format, 'tickets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_list_ticket_pipelines',
    `List all ticket pipelines and their stages.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const pipelines = await client.listTicketPipelines();
        return formatResponse(pipelines, format, 'pipelines');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
