# Diffstat Feature

## Overview
Added support for the Bitbucket API `diffstat` endpoint to show file change statistics for pull requests. Also added URL parsing support to extract workspace, repository, and PR number from Bitbucket PR URLs.

## Usage

### Command with PR Number
```bash
node ../bitbucket-cmd/bin/bitbucket.js pr --diffstat <pr_num>
```

Or from within a repo:
```bash
bitbucket pr --diffstat <pr_num>
```

### Command with URL
You can now use a Bitbucket PR URL directly without needing to navigate to the repository directory:

```bash
# Using diffstat with URL
bitbucket pr -u "https://bitbucket.org/workspace/repo/pull-requests/123" --diffstat

# Using diff with URL
bitbucket pr -u "https://bitbucket.org/workspace/repo/pull-requests/123" -d

# URL also works with /diff or /diffstat paths
bitbucket pr -u "https://bitbucket.org/workspace/repo/pull-requests/123/diff" -d
```

### Example with PR Number
```bash
cd market-order-subscription
node ../bitbucket-cmd/bin/bitbucket.js pr --diffstat 244
```

### Example with URL
```bash
# Works from any directory - extracts workspace, repo, and PR number from URL
node ../bitbucket-cmd/bin/bitbucket.js pr -u "https://bitbucket.org/paytmteam/market-order-subscription/pull-requests/244" --diffstat
```

### Output
The command displays a formatted table showing:
- **File**: The path of each modified file
- **Lines Added**: Number of lines added (shown in green)
- **Lines Removed**: Number of lines removed (shown in red)
- **Status**: File status (modified, added, removed, renamed)

Additionally, it shows a summary with total lines added and removed.

## URL Parsing Feature

The `-u` or `--url` option allows you to specify a Bitbucket PR URL directly. The tool will:
1. Parse the URL to extract workspace, repository name, and PR number
2. Use this information to fetch the PR data from any directory
3. You don't need to be in the repository directory

### Supported URL Formats
- `https://bitbucket.org/{workspace}/{repo}/pull-requests/{pr_number}`
- `https://bitbucket.org/{workspace}/{repo}/pull-requests/{pr_number}/diff`
- `https://bitbucket.org/{workspace}/{repo}/pull-requests/{pr_number}/diffstat`
- `https://api.bitbucket.org/2.0/repositories/{workspace}/{repo}/pullrequests/{pr_number}`

### Benefits
- No need to navigate to the repository directory
- Can view PR statistics for any repository
- Can easily share commands with PR URLs
- Convenient when working with multiple repositories

## API Reference
This implementation uses the Bitbucket Cloud REST API endpoint:
```
GET /repositories/{workspace}/{repo_slug}/pullrequests/{pull_request_id}/diffstat
```

Documentation: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-pull-request-id-diffstat-get

## Implementation Details

### Files Modified
1. **lib/bitbucket/pr.js** - Added:
   - `parseBitbucketUrl()` function to extract workspace, repo, and PR number from URLs
   - Updated `getConfig()` to accept URL override parameters
   - Modified `diffstat()` function to support URL parsing
   - Modified `diff()` function to support URL parsing

2. **bin/bitbucket.js** - Added:
   - Command-line option: `-u, --url <pr_url>` to accept Bitbucket PR URLs
   - Updated option definitions to make PR number optional when URL is provided
   - Updated handlers to auto-detect diff/diffstat from URL path

### Comparison of Commands
- **`--diff`** (`-d`): Shows the actual line-by-line changes (unified diff format)
- **`--diffstat`**: Shows statistics about changes (number of lines added/removed per file)

Both commands now support:
- Traditional usage with PR number: `-d 244` or `--diffstat 244`
- URL-based usage: `-u "https://..." -d` or `-u "https://..." --diffstat`

### Usage Examples

```bash
# Traditional way (requires being in repo directory)
cd market-order-subscription
bitbucket pr --diffstat 244

# New way with URL (works from anywhere)
bitbucket pr -u "https://bitbucket.org/paytmteam/market-order-subscription/pull-requests/244" --diffstat

# Can use with diff too
bitbucket pr -u "https://bitbucket.org/paytmteam/market-order-subscription/pull-requests/244" -d

# Works even from different repo directories
cd market-payment
bitbucket pr -u "https://bitbucket.org/paytmteam/market-order-subscription/pull-requests/244" --diffstat
```
