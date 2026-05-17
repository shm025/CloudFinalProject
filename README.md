# TaskFlow — CMPS465 Cloud Project

A containerized To-Do REST API with a polished frontend, deployed via a full Azure CI/CD pipeline.

**Stack:** Node.js · Express · Docker · Azure Pipelines · Azure Container Registry · Azure App Service

---

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm start         # http://localhost:3000

# Run tests
npm test
```

---

## Project Structure

```
todo-app/
├── src/
│   ├── app.js              # Express app entry point
│   └── routes/
│       └── todos.js        # Todo CRUD routes
├── public/
│   └── index.html          # Frontend UI
├── tests/
│   └── todos.test.js       # Jest unit tests
├── Dockerfile              # Multi-stage Docker build
├── azure-pipelines.yml     # Full CI/CD pipeline
└── package.json
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/todos` | Get all todos |
| GET | `/api/todos/:id` | Get single todo |
| POST | `/api/todos` | Create todo `{ title }` |
| PATCH | `/api/todos/:id` | Toggle completed |
| DELETE | `/api/todos/:id` | Delete todo |
| GET | `/health` | Health check |

---

## Azure Setup Steps

### 1. Azure Container Registry
```bash
az group create --name CMPS465-YourID --location eastus
az acr create --resource-group CMPS465-YourID --name cmps465acr --sku Basic
az acr login --name cmps465acr
```

### 2. Azure App Service
```bash
az appservice plan create \
  --name cmps465-plan \
  --resource-group CMPS465-YourID \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group CMPS465-YourID \
  --plan cmps465-plan \
  --name cmps465-todo-prod \
  --deployment-container-image-name cmps465acr.azurecr.io/todo-app:latest
```

### 3. Staging Slot
```bash
az webapp deployment slot create \
  --name cmps465-todo-prod \
  --resource-group CMPS465-YourID \
  --slot staging
```

### 4. Azure DevOps Pipeline
1. Go to [dev.azure.com](https://dev.azure.com) → New Project
2. Pipelines → New Pipeline → GitHub → select your repo
3. Choose "Existing Azure Pipelines YAML file" → `azure-pipelines.yml`
4. Create service connections:
   - **ACR-ServiceConnection** → Docker Registry → Azure Container Registry
   - **Azure-ServiceConnection** → Azure Resource Manager
5. Set up manual approval: Environments → `production` → Approvals and checks

---

## Pipeline Flow

```
Push to any branch
      │
      ▼
 [CI Stage]
 Install → Test → Coverage Report
      │
      │ (main branch only)
      ▼
 [Docker Stage]
 Build image → Push to ACR
      │
      ▼
 [Deploy Staging]
 Deploy to staging slot → auto
      │
      ▼
 [⏸ Manual Approval Gate]
      │ (human approves in Azure DevOps)
      ▼
 [Deploy Production]
 Deploy to production → live
```

---

## Cost Management

- Set a $25 budget alert in Azure Cost Management
- Tag all resources: `Project=CMPS465`
- Delete ACR when not presenting (~$0.17/day)
- Use B1 App Service only during testing; downgrade to F1 for standby
