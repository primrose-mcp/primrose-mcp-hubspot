# Primrose MCP HubSpot

A Model Context Protocol (MCP) server for HubSpot CRM, deployed on Cloudflare Workers.

## Features

- **Contacts** - List, get, create, update, delete, and search contacts
- **Companies** - Full CRUD operations for companies
- **Deals** - Manage deals with pipeline and stage support
- **Tickets** - Customer support ticket management
- **Leads** - Lead capture and management
- **Products** - Product catalog management
- **Line Items** - Deal line item management
- **Quotes** - Quote creation and management
- **Commerce** - Commerce and payment features
- **Activities** - Calls, emails, and engagement tracking
- **Notes** - Note management across objects
- **Meetings** - Meeting scheduling and tracking
- **Associations** - Object relationship management
- **Properties** - Custom property management
- **Pipelines** - Pipeline and stage configuration
- **Owners** - User and owner management
- **Batch Operations** - Bulk create, update, and delete
- **Webhooks** - Webhook subscription management

## Authentication

This server uses a multi-tenant architecture. Pass your HubSpot credentials via request headers:

| Header | Description |
|--------|-------------|
| `X-CRM-API-Key` | HubSpot API key (required, or use access token) |
| `X-CRM-Access-Token` | OAuth access token (alternative to API key) |
| `X-CRM-Base-URL` | Override the default API base URL (optional) |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | POST | Streamable HTTP MCP endpoint |
| `/health` | GET | Health check |

## Installation

```bash
npm install
```

## Development

```bash
# Local development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

## Deployment

```bash
npm run deploy
```

## Testing

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to test the server:

```bash
npx @modelcontextprotocol/inspector
```

## API Reference

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- API Version: v3

## License

MIT
