/**
 * Meeting Tools
 *
 * MCP tools for meeting management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerMeetingTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_meetings',
    `List meetings from HubSpot with pagination.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of meetings to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listMeetings({ limit, cursor });
        return formatResponse(result, format, 'meetings');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_meeting',
    `Get a single meeting by ID.`,
    {
      id: z.string().describe('Meeting ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const meeting = await client.getMeeting(id);
        return formatResponse(meeting, format, 'meeting');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_meeting',
    `Create a new meeting in HubSpot.`,
    {
      title: z.string().describe('Meeting title (required)'),
      startTime: z.string().describe('Start time (ISO 8601, required)'),
      endTime: z.string().describe('End time (ISO 8601, required)'),
      body: z.string().optional().describe('Meeting description/notes'),
      outcome: z.string().optional().describe('Meeting outcome'),
      ownerId: z.string().optional().describe('Owner ID'),
      contactIds: z.array(z.string()).optional().describe('Contact IDs to associate'),
    },
    async (input) => {
      try {
        const meeting = await client.createMeeting(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Meeting created', meeting }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_meeting',
    `Update an existing meeting.`,
    {
      id: z.string().describe('Meeting ID to update'),
      title: z.string().optional(),
      body: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      outcome: z.string().optional(),
      ownerId: z.string().optional(),
    },
    async ({ id, ...input }) => {
      try {
        const meeting = await client.updateMeeting(id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Meeting updated', meeting }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_meeting',
    `Delete a meeting from HubSpot.`,
    {
      id: z.string().describe('Meeting ID to delete'),
    },
    async ({ id }) => {
      try {
        await client.deleteMeeting(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Meeting ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
