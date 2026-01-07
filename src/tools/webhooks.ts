/**
 * Webhook Tools
 *
 * MCP tools for viewing HubSpot webhook subscriptions (read-only).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerWebhookTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_list_webhook_subscriptions',
    `List webhook subscriptions for an app.

Note: This requires app-level access and an app ID.`,
    {
      appId: z.string().describe('HubSpot App ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ appId, format }) => {
      try {
        const subscriptions = await client.listWebhookSubscriptions(appId);
        return formatResponse(subscriptions, format, 'webhook_subscriptions');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
