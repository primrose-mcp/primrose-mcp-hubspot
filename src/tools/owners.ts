/**
 * Owner Tools
 *
 * MCP tools for managing HubSpot owners (users).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerOwnerTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_owners',
    `List all owners (users) in HubSpot.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const owners = await client.listOwners();
        return formatResponse(owners, format, 'owners');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_owner',
    `Get details for a specific owner.`,
    {
      id: z.string().describe('Owner ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ id, format }) => {
      try {
        const owner = await client.getOwner(id);
        return formatResponse(owner, format, 'owner');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
