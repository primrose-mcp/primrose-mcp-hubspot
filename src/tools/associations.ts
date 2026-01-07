/**
 * Association Tools
 *
 * MCP tools for managing associations between HubSpot objects.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerAssociationTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_create_association',
    `Create an association between two HubSpot objects.

Common association type IDs:
- Contact to Company: 279 (primary), 280 (all)
- Deal to Contact: 3
- Deal to Company: 5
- Note to Contact: 202
- Call to Contact: 194
- Email to Contact: 198
- Meeting to Contact: 200
- Task to Contact: 204
- Ticket to Contact: 16
- Ticket to Company: 26`,
    {
      fromObjectType: z.string().describe('Source object type (e.g., contacts, deals, tickets)'),
      fromObjectId: z.string().describe('Source object ID'),
      toObjectType: z.string().describe('Target object type'),
      toObjectId: z.string().describe('Target object ID'),
      associationTypeId: z.string().describe('Association type ID'),
    },
    async ({ fromObjectType, fromObjectId, toObjectType, toObjectId, associationTypeId }) => {
      try {
        await client.createAssociation(
          fromObjectType,
          fromObjectId,
          toObjectType,
          toObjectId,
          associationTypeId
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Association created between ${fromObjectType}/${fromObjectId} and ${toObjectType}/${toObjectId}`,
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
    'hubspot_delete_association',
    `Delete an association between two HubSpot objects.`,
    {
      fromObjectType: z.string().describe('Source object type'),
      fromObjectId: z.string().describe('Source object ID'),
      toObjectType: z.string().describe('Target object type'),
      toObjectId: z.string().describe('Target object ID'),
      associationTypeId: z.string().describe('Association type ID'),
    },
    async ({ fromObjectType, fromObjectId, toObjectType, toObjectId, associationTypeId }) => {
      try {
        await client.deleteAssociation(
          fromObjectType,
          fromObjectId,
          toObjectType,
          toObjectId,
          associationTypeId
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Association deleted between ${fromObjectType}/${fromObjectId} and ${toObjectType}/${toObjectId}`,
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
    'hubspot_list_associations',
    `List associations for a HubSpot object.`,
    {
      objectType: z.string().describe('Object type (e.g., contacts, deals)'),
      objectId: z.string().describe('Object ID'),
      toObjectType: z.string().describe('Target object type to get associations for'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ objectType, objectId, toObjectType, format }) => {
      try {
        const associations = await client.listAssociations(objectType, objectId, toObjectType);
        return formatResponse(associations, format, 'associations');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_association_labels',
    `Get available association labels/types between two object types.`,
    {
      fromObjectType: z.string().describe('Source object type'),
      toObjectType: z.string().describe('Target object type'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ fromObjectType, toObjectType, format }) => {
      try {
        const labels = await client.getAssociationLabels(fromObjectType, toObjectType);
        return formatResponse(labels, format, 'association_labels');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
