/**
 * Activity Tools
 *
 * MCP tools for activity logging (calls, emails, tasks, etc.)
 * CUSTOMIZE: Update tool names with your CRM prefix (e.g., hubspot_log_call)
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all activity-related tools
 */
export function registerActivityTools(server: McpServer, client: CrmClient): void {
  // ===========================================================================
  // List Activities
  // ===========================================================================
  server.tool(
    'hubspot_list_activities',
    `List activities (calls, emails, tasks, etc.) from the CRM.

Args:
  - recordId: Filter by associated record ID (contact, company, or deal)
  - limit: Number of activities to return (1-100, default: 20)
  - cursor: Pagination cursor
  - format: Response format

Returns:
  Paginated list of activities.`,
    {
      recordId: z.string().optional().describe('Filter by associated record ID'),
      limit: z.number().int().min(1).max(100).default(20),
      cursor: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ recordId, limit, cursor, format }) => {
      try {
        const result = await client.listActivities({ limit, cursor, recordId });
        return formatResponse(result, format, 'activities');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Log Call
  // ===========================================================================
  server.tool(
    'hubspot_log_call',
    `Log a phone call in the CRM.

Args:
  - contactId: Contact ID the call was with
  - subject: Call subject/title
  - notes: Call notes/summary
  - durationMinutes: Call duration in minutes

Returns:
  The created call activity.`,
    {
      contactId: z.string().describe('Contact ID'),
      subject: z.string().describe('Call subject/title'),
      notes: z.string().optional().describe('Call notes/summary'),
      durationMinutes: z.number().int().optional().describe('Call duration in minutes'),
    },
    async ({ contactId, subject, notes, durationMinutes }) => {
      try {
        const activity = await client.logCall(contactId, subject, notes, durationMinutes);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Call logged', activity }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Log Email
  // ===========================================================================
  server.tool(
    'hubspot_log_email',
    `Log an email in the CRM.

Args:
  - contactId: Contact ID the email was with
  - subject: Email subject
  - body: Email body content
  - direction: 'sent' for outgoing, 'received' for incoming

Returns:
  The created email activity.`,
    {
      contactId: z.string().describe('Contact ID'),
      subject: z.string().describe('Email subject'),
      body: z.string().describe('Email body content'),
      direction: z
        .enum(['sent', 'received'])
        .describe("'sent' for outgoing, 'received' for incoming"),
    },
    async ({ contactId, subject, body, direction }) => {
      try {
        const activity = await client.logEmail(contactId, subject, body, direction);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Email logged', activity }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Task
  // ===========================================================================
  server.tool(
    'hubspot_create_task',
    `Create a task in the CRM.

Args:
  - subject: Task subject/title
  - body: Task description
  - dueDate: Due date (ISO 8601)
  - contactIds: Associated contact IDs
  - companyId: Associated company ID
  - dealId: Associated deal ID

Returns:
  The created task.`,
    {
      subject: z.string().describe('Task subject/title'),
      body: z.string().optional().describe('Task description'),
      dueDate: z.string().optional().describe('Due date (ISO 8601)'),
      contactIds: z.array(z.string()).optional().describe('Associated contact IDs'),
      companyId: z.string().optional().describe('Associated company ID'),
      dealId: z.string().optional().describe('Associated deal ID'),
    },
    async (input) => {
      try {
        const activity = await client.createActivity({
          type: 'task',
          subject: input.subject,
          body: input.body,
          dueDate: input.dueDate,
          contactIds: input.contactIds,
          companyId: input.companyId,
          dealId: input.dealId,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Task created', activity }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
