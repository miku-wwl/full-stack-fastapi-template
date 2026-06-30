# ForeXchange Frontend Deployment Pipeline Plan

This note records the recommended future deployment approach for this project.
It is intentionally written as an implementation plan, so it can be picked up later
when there is time to formalize the release process.

## Current Situation

The project currently has a local frontend deployment script:

```powershell
frontend/deploy-frontend.ps1
```

That script does three important things:

1. Reads Terraform outputs, especially the backend URL and Azure Storage details.
2. Writes the backend URL into `frontend/.env.production` as `VITE_API_URL`.
3. Builds the frontend and uploads `frontend/dist` to Azure Blob Static Website.

The current flow is practical for local/manual deployment:

```text
Run Terraform locally
↓
Run frontend/deploy-frontend.ps1 locally
↓
Upload built frontend files to Azure Blob Static Website
```

This is acceptable for a student project, prototype, or low-formality deployment.
However, it is not the ideal long-term production release process, because it
depends on the developer's local machine, local Azure login, local Node/npm setup,
and local Terraform state.

## Recommended Target Flow

For this project, the best next step is to add a GitHub Actions workflow only for
frontend deployment.

Recommended split:

```text
Terraform:
  Run manually when infrastructure changes.

GitHub Actions frontend deployment:
  Run whenever the frontend should be released.
```

In other words:

```text
Terraform creates and updates Azure infrastructure
↓
GitHub Actions builds frontend from main branch
↓
GitHub Actions uploads dist/ to Blob Static Website
```

This is a good middle ground. It avoids making the project too heavy while still
removing the most fragile part: manually building and uploading the frontend from
a local machine.

## Why Not Put Terraform Apply in the Same Pipeline Yet?

Terraform and frontend deployment have different release rhythms.

Terraform manages infrastructure:

```text
Resource Group
Storage Account
Static Website hosting
Container Apps
PostgreSQL
Key Vault
Queues
Networking-related configuration
```

Frontend deployment only replaces static files:

```text
index.html
assets/*.js
assets/*.css
images
fonts
```

Infrastructure changes are less frequent and riskier. Frontend releases are more
frequent and safer. For this project, automatically running `terraform apply` on
every frontend change would be unnecessary and may increase risk.

A more mature future setup could have two separate workflows:

```text
terraform-plan-apply.yml
deploy-frontend.yml
```

But the first useful step should be:

```text
deploy-frontend.yml
```

## The Terraform Output Problem

The local deployment script currently uses:

```powershell
terraform '-chdir=../tf' output -raw backend_url
terraform '-chdir=../tf' output -raw storage_account_name
terraform '-chdir=../tf' output -raw resource_group_name
```

That works locally because Terraform has access to the local state file.

GitHub Actions runs on a clean runner. It will not automatically have access to
the same Terraform state. Therefore, a GitHub Actions workflow should not rely on
`terraform output` unless Terraform remote state is configured first.

There are three possible solutions.

## Option A: Use GitHub Variables for Terraform Outputs

This is the recommended option for the current project.

Run these commands locally after infrastructure has been created:

```powershell
terraform -chdir=tf output -raw backend_url
terraform -chdir=tf output -raw storage_account_name
terraform -chdir=tf output -raw resource_group_name
```

Then save the values in GitHub repository variables:

```text
VITE_API_URL
AZURE_STORAGE_ACCOUNT
AZURE_RESOURCE_GROUP
```

Example values:

```text
VITE_API_URL=https://your-backend.example.azurecontainerapps.io
AZURE_STORAGE_ACCOUNT=stfxprod79rfgv
AZURE_RESOURCE_GROUP=rg-forexchange-prod
```

Advantages:

```text
Simple
Easy to understand
Does not require Terraform remote state
Good enough for this project's current maturity level
```

Tradeoff:

```text
If Terraform later changes the backend URL, storage account, or resource group,
the GitHub variables must be updated manually.
```

This tradeoff is acceptable because these values should not change frequently.

## Option B: Use Terraform Remote State

This is the more formal infrastructure-as-code approach.

Terraform state would be stored in Azure Storage instead of only on the local
machine. Then GitHub Actions could run:

```bash
terraform -chdir=tf init
terraform -chdir=tf output -raw backend_url
terraform -chdir=tf output -raw storage_account_name
terraform -chdir=tf output -raw resource_group_name
```

This requires a backend block similar to:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "..."
    storage_account_name = "..."
    container_name       = "tfstate"
    key                  = "forexchange-prod.tfstate"
  }
}
```

Advantages:

```text
More production-like
Terraform output is always read from the real shared state
Better for teams
Better for long-term infrastructure governance
```

Tradeoff:

```text
Requires remote state setup
Requires more Azure permissions
Requires stronger CI/CD security design
More moving parts than currently necessary
```

This can be done later if the project becomes more formal.

## Option C: Query Azure Directly in the Workflow

The workflow could use Azure CLI commands to discover the resources.

For example:

```bash
az storage account list --resource-group "$AZURE_RESOURCE_GROUP"
az containerapp show --name "..." --resource-group "$AZURE_RESOURCE_GROUP"
```

This works, but it is less clean than using Terraform outputs or GitHub variables.
Since Terraform already defines the important outputs, Option A is simpler for
now.

## Recommended GitHub Actions Design

Create:

```text
.github/workflows/deploy-frontend.yml
```

Recommended trigger:

```text
Manual trigger through workflow_dispatch
Optional automatic deployment when main changes frontend files
```

For a cautious setup, start with manual trigger only:

```yaml
on:
  workflow_dispatch:
```

After this is tested, optionally add:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - "frontend/**"
      - ".github/workflows/deploy-frontend.yml"
```

## Required GitHub Configuration

In GitHub repository settings, add these repository variables:

```text
VITE_API_URL
AZURE_STORAGE_ACCOUNT
AZURE_RESOURCE_GROUP
```

For Azure authentication, use one of these approaches.

Recommended for later:

```text
OIDC from GitHub Actions to Azure
```

Simpler first version:

```text
AZURE_CREDENTIALS as a GitHub secret
```

The `AZURE_CREDENTIALS` secret is usually a JSON service principal credential.
It should have permission to upload blobs to the Storage Account.

Minimum practical Azure permissions:

```text
Storage Blob Data Contributor on the storage account
Reader on the resource group, if the workflow needs to read account metadata
```

If the workflow retrieves account keys with:

```bash
az storage account keys list
```

then it needs stronger management-plane permissions. A cleaner future approach is
to upload using Azure AD/RBAC instead of storage account keys.

## Example Workflow

This is a starting point, not the only possible final version.

```yaml
name: Deploy Frontend to Azure Blob Static Website

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Create production environment file
        run: echo "VITE_API_URL=${{ vars.VITE_API_URL }}" > .env.production

      - name: Build frontend
        run: npm run build

      - name: Azure login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Upload dist to Blob Static Website
        run: |
          ACCOUNT_KEY=$(az storage account keys list \
            --account-name "${{ vars.AZURE_STORAGE_ACCOUNT }}" \
            --resource-group "${{ vars.AZURE_RESOURCE_GROUP }}" \
            --query "[0].value" \
            -o tsv)

          az storage blob upload-batch \
            --account-name "${{ vars.AZURE_STORAGE_ACCOUNT }}" \
            --account-key "$ACCOUNT_KEY" \
            --destination '$web' \
            --source ./dist \
            --overwrite \
            --no-progress
```

## Safer Future Upload Style

The example above uses a storage account key because it mirrors the local
PowerShell script and is easy to understand.

Later, prefer Azure AD/RBAC-based upload:

```bash
az storage blob upload-batch \
  --account-name "$AZURE_STORAGE_ACCOUNT" \
  --auth-mode login \
  --destination '$web' \
  --source ./dist \
  --overwrite \
  --no-progress
```

This avoids retrieving storage account keys in the workflow.

For that to work, the GitHub Actions Azure identity needs:

```text
Storage Blob Data Contributor
```

on the Storage Account.

## Production Approval

If this project later needs a more production-like release process, use GitHub
Environments.

Suggested setup:

```text
Environment name: production
Required reviewers: enabled
Deployment branch: main only
```

Then the workflow can declare:

```yaml
environment:
  name: production
```

Release flow:

```text
Developer merges to main
↓
GitHub Actions builds frontend
↓
Deployment waits for approval
↓
Reviewer clicks approve
↓
Workflow uploads dist to Azure Blob Static Website
```

This is closer to how small professional teams manage production deployment.

## CDN or Front Door Later

The current frontend URL is the Azure Blob Static Website endpoint:

```text
https://<storage-account>.z8.web.core.windows.net/
```

That is fine for a simple deployment.

For a more production-like setup, put one of these in front of it:

```text
Azure CDN
Azure Front Door
Cloudflare
```

Benefits:

```text
Custom domain
TLS certificate management
Better global caching
Cache purge after deployment
More production-like user-facing URL
```

If CDN or Front Door is added later, the deployment workflow should also purge
the cache after uploading new frontend files.

## Suggested Implementation Order

Recommended order when there is time:

1. Keep `frontend/deploy-frontend.ps1` as the local emergency/manual deploy tool.
2. Add GitHub repository variables:
   - `VITE_API_URL`
   - `AZURE_STORAGE_ACCOUNT`
   - `AZURE_RESOURCE_GROUP`
3. Add Azure authentication for GitHub Actions.
4. Add `.github/workflows/deploy-frontend.yml` with manual trigger only.
5. Test manual deployment from GitHub Actions.
6. Add GitHub Environment approval if desired.
7. Optionally add automatic deployment on `main` frontend changes.
8. Later, migrate Terraform state to Azure remote backend if infrastructure work
   becomes more team-based or production-like.

## Final Recommendation

For this project right now:

```text
Do add a frontend deployment pipeline.
Do not immediately automate terraform apply.
Do not require GitHub Actions to run terraform output yet.
Use GitHub Variables to store the stable Terraform output values.
Keep Terraform as a separate manual infrastructure step for now.
```

This gives the project a much better release workflow without adding too much
operational complexity.
