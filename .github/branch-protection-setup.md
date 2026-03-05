# Branch Protection Rules Setup

After pushing this repository to GitHub, apply these branch protection rules via
**Settings → Branches → Add branch protection rule** for the `main` branch.

## Required Settings for `main`

| Setting                                                          | Value                    |
| ---------------------------------------------------------------- | ------------------------ |
| Require a pull request before merging                            | ✅ Enabled               |
| Required approvals                                               | 1                        |
| Dismiss stale pull request approvals when new commits are pushed | ✅ Enabled               |
| Require status checks to pass before merging                     | ✅ Enabled               |
| Require branches to be up to date before merging                 | ✅ Enabled               |
| Require conversation resolution before merging                   | ✅ Enabled               |
| Restrict who can push to matching branches                       | ✅ Enabled (admins only) |
| Allow force pushes                                               | ❌ Disabled              |
| Allow deletions                                                  | ❌ Disabled              |

## Required Status Checks

Add these CI job names as required checks:

- `CI Gate (All Checks Passed)`
- `TypeScript Type Check`
- `Tests & Coverage`
- `Production Build`

## GitHub CLI Command (Optional)

If you have admin access and the GitHub CLI configured, run:

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["CI Gate (All Checks Passed)","TypeScript Type Check","Tests & Coverage","Production Build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## Recommended Labels to Create

Create these labels in **Issues → Labels** for the auto-labeler and PR size checker:

| Label             | Color     | Description                            |
| ----------------- | --------- | -------------------------------------- |
| `frontend`        | `#0075ca` | Frontend changes                       |
| `backend`         | `#e4e669` | Backend/server changes                 |
| `database`        | `#d93f0b` | Database schema or migration changes   |
| `ci`              | `#0e8a16` | CI/CD pipeline changes                 |
| `dependencies`    | `#0075ca` | Dependency updates                     |
| `tests`           | `#bfd4f2` | Test additions or changes              |
| `documentation`   | `#cfd3d7` | Documentation updates                  |
| `configuration`   | `#fef2c0` | Config file changes                    |
| `size/XS`         | `#3cbf00` | PR < 50 lines                          |
| `size/S`          | `#5d9801` | PR 50–199 lines                        |
| `size/M`          | `#e4a015` | PR 200–499 lines                       |
| `size/L`          | `#e05d44` | PR 500–999 lines                       |
| `size/XL`         | `#b60205` | PR 1000+ lines                         |
| `breaking-change` | `#b60205` | Breaking change (DB drop, API removal) |
| `needs-review`    | `#e11d48` | Requires manual review                 |
| `stale`           | `#cccccc` | No activity for 14+ days               |
| `automated`       | `#84b6eb` | Automated PR (Dependabot)              |
