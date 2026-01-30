# HubSpot MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/hubspot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for integrating with the HubSpot CRM platform. This server enables AI assistants to manage contacts, companies, deals, tickets, and more through HubSpot's API.

## Features

- **Activity Management** - Track and manage activities and engagements
- **Association Management** - Link objects together with associations
- **Batch Operations** - Perform bulk operations efficiently
- **Commerce Tools** - Manage commerce-related objects
- **Company Management** - Create and manage company records
- **Contact Management** - Full contact lifecycle management
- **Deal Management** - Track and manage sales deals
- **Lead Management** - Capture and manage leads
- **Line Item Management** - Manage deal line items
- **Meeting Management** - Schedule and manage meetings
- **Note Management** - Create and manage notes
- **Owner Management** - Access and manage HubSpot owners
- **Pipeline Management** - Configure sales and ticket pipelines
- **Product Management** - Manage product catalog
- **Property Management** - Create and manage custom properties
- **Quote Management** - Create and manage quotes
- **Ticket Management** - Handle support tickets
- **Webhook Management** - Configure webhook subscriptions

## Quick Start

The easiest way to get started is using the [Primrose SDK](https://github.com/primrose-ai/primrose-mcp):

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseClient } from 'primrose-mcp';

const client = new PrimroseClient({
  service: 'hubspot',
  headers: {
    'X-CRM-Access-Token': 'your-access-token'
  }
});
```

## Manual Installation

```bash
# Clone and install
git clone https://github.com/primrose-ai/primrose-mcp-hubspot.git
cd primrose-mcp-hubspot
npm install

# Build
npm run build

# Run locally
npm run dev
```

## Configuration

### Required Headers (one of)

| Header | Description |
|--------|-------------|
| `X-CRM-API-Key` | Your HubSpot API key |
| `X-CRM-Access-Token` | OAuth access token |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-CRM-Base-URL` | Override the default API base URL |
| `X-CRM-Client-ID` | OAuth client ID |
| `X-CRM-Client-Secret` | OAuth client secret |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CHARACTER_LIMIT` | 50000 | Maximum response character limit |
| `DEFAULT_PAGE_SIZE` | 20 | Default pagination size |
| `MAX_PAGE_SIZE` | 100 | Maximum pagination size |

## Available Tools

### Activity Tools
- Track activities and engagements
- Create and manage tasks
- Log calls and emails

### Association Tools
- Create associations between objects
- List associations
- Remove associations

### Batch Tools
- Batch create objects
- Batch update objects
- Batch delete objects

### Commerce Tools
- Manage commerce objects
- Handle transactions

### Company Tools
- Create and update companies
- Search for companies
- Manage company properties

### Contact Tools
- Create and update contacts
- Search for contacts
- Manage contact properties

### Deal Tools
- Create and update deals
- Track deal stages
- Manage deal properties

### Lead Tools
- Capture leads
- Convert leads to contacts
- Manage lead properties

### Line Item Tools
- Add line items to deals
- Manage line item properties
- Calculate totals

### Meeting Tools
- Schedule meetings
- Access meeting information
- Manage meeting settings

### Note Tools
- Create notes on records
- Update and delete notes
- Associate notes with objects

### Owner Tools
- List HubSpot owners
- Access owner information
- Assign owners to records

### Pipeline Tools
- Create and manage pipelines
- Configure pipeline stages
- Set stage properties

### Product Tools
- Manage product catalog
- Create and update products
- Set product pricing

### Property Tools
- Create custom properties
- Manage property groups
- Configure property settings

### Quote Tools
- Create quotes
- Manage quote templates
- Send quotes

### Ticket Tools
- Create support tickets
- Track ticket status
- Manage ticket properties

### Webhook Tools
- Create webhook subscriptions
- Manage webhook settings
- Handle webhook events

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run type checking
npm run typecheck
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [HubSpot Developer Portal](https://developers.hubspot.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
