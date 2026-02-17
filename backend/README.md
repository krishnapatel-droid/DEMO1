# Backend - CRUD API

## Setup

```bash
cd backend
npm install
```

## Development

```bash
npm run dev
```

Server runs on http://localhost:3001

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/items | List items (supports q, sortBy, sortDir, page, pageSize) |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create new item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |

## Examples

```bash
# List all items
curl http://localhost:3001/api/items

# Search items
curl "http://localhost:3001/api/items?q=welcome"

# Sort and paginate
curl "http://localhost:3001/api/items?sortBy=title&sortDir=asc&page=1&pageSize=10"

# Create item
curl -X POST http://localhost:3001/api/items \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Test", "status": "active"}'

# Update item
curl -X PUT http://localhost:3001/api/items/:id \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

# Delete item
curl -X DELETE http://localhost:3001/api/items/:id
```
