/**
 * Note Tools
 *
 * MCP tools for note management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerNoteTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_notes',
    `List notes from HubSpot with pagination.`,
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of notes to return'),
      cursor: z.string().optional().describe('Pagination cursor'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ limit, cursor, format }) => {
      try {
        const result = await client.listNotes({ limit, cursor });
        return formatResponse(result, format, 'notes');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_note',
    `Get a single note by ID.`,
    {
      id: z.string().describe('Note ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const note = await client.getNote(id);
        return formatResponse(note, format, 'note');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_note',
    `Create a new note in HubSpot.`,
    {
      body: z.string().describe('Note content (required)'),
      timestamp: z.string().optional().describe('Note timestamp (ISO 8601)'),
      ownerId: z.string().optional().describe('Owner ID'),
      contactId: z.string().optional().describe('Contact ID to associate'),
      companyId: z.string().optional().describe('Company ID to associate'),
      dealId: z.string().optional().describe('Deal ID to associate'),
    },
    async (input) => {
      try {
        const note = await client.createNote(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Note created', note }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_note',
    `Update an existing note.`,
    {
      id: z.string().describe('Note ID to update'),
      body: z.string().optional(),
      timestamp: z.string().optional(),
      ownerId: z.string().optional(),
    },
    async ({ id, ...input }) => {
      try {
        const note = await client.updateNote(id, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Note updated', note }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_note',
    `Delete a note from HubSpot.`,
    {
      id: z.string().describe('Note ID to delete'),
    },
    async ({ id }) => {
      try {
        await client.deleteNote(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Note ${id} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
