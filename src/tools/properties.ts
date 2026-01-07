/**
 * Property Tools
 *
 * MCP tools for managing HubSpot object properties.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerPropertyTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_properties',
    `List all properties for an object type.`,
    {
      objectType: z.string().describe('Object type (contacts, companies, deals, tickets, etc.)'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ objectType, format }) => {
      try {
        const properties = await client.listProperties(objectType);
        return formatResponse(properties, format, 'properties');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_get_property',
    `Get details for a specific property.`,
    {
      objectType: z.string().describe('Object type'),
      propertyName: z.string().describe('Property name'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ objectType, propertyName, format }) => {
      try {
        const property = await client.getProperty(objectType, propertyName);
        return formatResponse(property, format, 'property');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_property',
    `Create a new custom property.`,
    {
      objectType: z.string().describe('Object type'),
      name: z.string().describe('Property internal name (required)'),
      label: z.string().describe('Property display label (required)'),
      type: z.enum(['string', 'number', 'date', 'datetime', 'enumeration', 'bool']).describe('Property type'),
      fieldType: z.enum(['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'radio', 'booleancheckbox']).describe('Field type'),
      groupName: z.string().describe('Property group name'),
      description: z.string().optional().describe('Property description'),
      options: z.array(z.object({
        label: z.string(),
        value: z.string(),
        displayOrder: z.number(),
        hidden: z.boolean().default(false),
      })).optional().describe('Options for enumeration properties'),
    },
    async ({ objectType, ...input }) => {
      try {
        const property = await client.createProperty(objectType, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Property created', property }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_property',
    `Update an existing property.`,
    {
      objectType: z.string().describe('Object type'),
      propertyName: z.string().describe('Property name'),
      label: z.string().optional().describe('New display label'),
      description: z.string().optional().describe('New description'),
      options: z.array(z.object({
        label: z.string(),
        value: z.string(),
        displayOrder: z.number(),
        hidden: z.boolean().default(false),
      })).optional().describe('Updated options'),
    },
    async ({ objectType, propertyName, ...input }) => {
      try {
        const property = await client.updateProperty(objectType, propertyName, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Property updated', property }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_property',
    `Delete a custom property.`,
    {
      objectType: z.string().describe('Object type'),
      propertyName: z.string().describe('Property name to delete'),
    },
    async ({ objectType, propertyName }) => {
      try {
        await client.deleteProperty(objectType, propertyName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Property ${propertyName} deleted from ${objectType}`,
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
    'hubspot_list_property_groups',
    `List property groups for an object type.`,
    {
      objectType: z.string().describe('Object type'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ objectType, format }) => {
      try {
        const groups = await client.listPropertyGroups(objectType);
        return formatResponse(groups, format, 'property_groups');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
