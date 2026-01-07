/**
 * Pipeline Tools
 *
 * MCP tools for managing HubSpot pipelines and stages.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { CrmClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerPipelineTools(server: McpServer, client: CrmClient): void {
  server.tool(
    'hubspot_get_pipeline',
    `Get a specific pipeline by ID.`,
    {
      objectType: z.string().describe('Object type (deals, tickets)'),
      pipelineId: z.string().describe('Pipeline ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ objectType, pipelineId, format }) => {
      try {
        const pipeline = await client.getPipeline(objectType, pipelineId);
        return formatResponse(pipeline, format, 'pipeline');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_pipeline',
    `Create a new pipeline.`,
    {
      objectType: z.string().describe('Object type (deals, tickets)'),
      label: z.string().describe('Pipeline name'),
      displayOrder: z.number().optional().describe('Display order'),
      stages: z.array(z.object({
        label: z.string().describe('Stage name'),
        displayOrder: z.number().describe('Stage order'),
        metadata: z.object({
          probability: z.number().optional(),
          isClosed: z.boolean().optional(),
        }).optional(),
      })).describe('Pipeline stages'),
    },
    async ({ objectType, ...input }) => {
      try {
        const pipeline = await client.createPipeline(objectType, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Pipeline created', pipeline }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_pipeline',
    `Update an existing pipeline.`,
    {
      objectType: z.string().describe('Object type'),
      pipelineId: z.string().describe('Pipeline ID'),
      label: z.string().optional().describe('New pipeline name'),
      displayOrder: z.number().optional().describe('New display order'),
    },
    async ({ objectType, pipelineId, ...input }) => {
      try {
        const pipeline = await client.updatePipeline(objectType, pipelineId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Pipeline updated', pipeline }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_pipeline',
    `Delete a pipeline.`,
    {
      objectType: z.string().describe('Object type'),
      pipelineId: z.string().describe('Pipeline ID to delete'),
    },
    async ({ objectType, pipelineId }) => {
      try {
        await client.deletePipeline(objectType, pipelineId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Pipeline ${pipelineId} deleted`,
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
    'hubspot_get_pipeline_stage',
    `Get a specific pipeline stage.`,
    {
      objectType: z.string().describe('Object type'),
      pipelineId: z.string().describe('Pipeline ID'),
      stageId: z.string().describe('Stage ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ objectType, pipelineId, stageId, format }) => {
      try {
        const stage = await client.getPipelineStage(objectType, pipelineId, stageId);
        return formatResponse(stage, format, 'stage');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_create_pipeline_stage',
    `Create a new stage in a pipeline.`,
    {
      objectType: z.string().describe('Object type'),
      pipelineId: z.string().describe('Pipeline ID'),
      label: z.string().describe('Stage name'),
      displayOrder: z.number().describe('Stage order'),
      metadata: z.object({
        probability: z.number().optional(),
        isClosed: z.boolean().optional(),
      }).optional(),
    },
    async ({ objectType, pipelineId, ...input }) => {
      try {
        const stage = await client.createPipelineStage(objectType, pipelineId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Stage created', stage }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_update_pipeline_stage',
    `Update an existing pipeline stage.`,
    {
      objectType: z.string().describe('Object type'),
      pipelineId: z.string().describe('Pipeline ID'),
      stageId: z.string().describe('Stage ID'),
      label: z.string().optional().describe('New stage name'),
      displayOrder: z.number().optional().describe('New display order'),
      metadata: z.object({
        probability: z.number().optional(),
        isClosed: z.boolean().optional(),
      }).optional(),
    },
    async ({ objectType, pipelineId, stageId, ...input }) => {
      try {
        const stage = await client.updatePipelineStage(objectType, pipelineId, stageId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Stage updated', stage }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'hubspot_delete_pipeline_stage',
    `Delete a pipeline stage.`,
    {
      objectType: z.string().describe('Object type'),
      pipelineId: z.string().describe('Pipeline ID'),
      stageId: z.string().describe('Stage ID to delete'),
    },
    async ({ objectType, pipelineId, stageId }) => {
      try {
        await client.deletePipelineStage(objectType, pipelineId, stageId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: `Stage ${stageId} deleted`,
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
