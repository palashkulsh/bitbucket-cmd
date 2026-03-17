# URL-Based PR Operations

## Overview
You can now use Bitbucket PR URLs directly with the `bitbucket pr` command. This eliminates the need to navigate to specific repository directories and makes it easy to work with PRs across multiple repositories.

**Key Feature**: URL-based commands work from **ANY directory** - even non-configured repositories or system directories like `/tmp`!

## Prerequisites

### One-Time Setup
You only need to configure bitbucket-cmd **once** from any configured repository. After that, URL-based commands work from anywhere!

```bash
# One-time setup (do this from any repository)
cd /path/to/any/configured/repo
bitbucket config
# Follow prompts to set up authentication

# After this, you can use URL commands from ANYWHERE:
cd /tmp
bitbucket pr -u "https://..." --diffstat  # Works!
cd ~
bitbucket pr -u "https://..." -d  # Works!
cd /any/directory
bitbucket pr -u "https://..." --diffstat  # Works!
```

### How It Works
- **URL-based operations** (`-u` flag) use the default authentication stored in `~/.bitbucketconfigrc`
- **Traditional operations** (without `-u`) require the current directory to be configured
- Once configured, URL operations work from any directory - even non-git directories!
- No need to configure or clone the target repository

## The `-u` / `--url` Option

The `-u` or `--url` option allows you to provide a Bitbucket PR URL instead of navigating to the repository directory.

### Syntax
```bash
bitbucket pr -u <bitbucket_pr_url> <command>
```

### Supported URL Formats

The tool automatically extracts workspace, repository, and PR number from these URL formats:

1. **Standard PR URL**
   ```
   https://bitbucket.org/{workspace}/{repo}/pull-requests/{pr_number}
   ```

2. **PR URL with diff path**
   ```
   https://bitbucket.org/{workspace}/{repo}/pull-requests/{pr_number}/diff
   ```

3. **PR URL with diffstat path**
   ```
   https://bitbucket.org/{workspace}/{repo}/pull-requests/{pr_number}/diffstat
   ```

4. **API URL**
   ```
   https://api.bitbucket.org/2.0/repositories/{workspace}/{repo}/pullrequests/{pr_number}
   ```

## Usage Examples

### Diffstat with URL
```bash
# View statistics for any PR from any directory
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/248" --diffstat

# Output:
# Extracted from URL: workspace=your-workspace, repo=your-repo, PR=248
# https://api.bitbucket.org/2.0/repositories/your-workspace/your-repo/pullrequests/248/diffstat
# Getting diffstat for PR 248
# Diffstat for PR 248
# ╔════════════╤═════════════╤═══════════════╤══════════╗
# ║ File       ║ Lines Added ║ Lines Removed ║ Status   ║
# ╟────────────┼─────────────┼───────────────┼──────────╢
# ║ README.md  ║ +100        ║ -20           ║ modified ║
# ╚════════════╧═════════════╧═══════════════╧══════════╝
# 
# Total changes: +100 -20
```

### Diff with URL
```bash
# View full diff for any PR from any directory
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/244" -d

# Output:
# Extracted from URL: workspace=your-workspace, repo=your-repo, PR=244
# https://api.bitbucket.org/2.0/repositories/your-workspace/your-repo/pullrequests/244/diff
# Diffing PR 244
# Diff PR  diff --git a/api/cancel.js b/api/cancel.js
# index 974f508..ddf11e2 100644
# --- a/api/cancel.js
# +++ b/api/cancel.js
# ...
```

### Using URL with /diff or /diffstat in path
```bash
# The tool recognizes the URL path and automatically applies the command
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/248/diff" -d
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/248/diffstat" --diffstat
```

## Comparison: Traditional vs URL-Based

### Traditional Method (requires navigation)
```bash
# Must be in the repository directory
cd /path/to/your-repo
bitbucket pr --diffstat 248
```

### URL-Based Method (works from anywhere)
```bash
# Can be in any directory
cd /anywhere
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/248" --diffstat
```

## Benefits

1. **No Directory Navigation Required**
   - Work with PRs from any directory
   - No need to clone or navigate to repositories
   - **Works even from non-configured directories** (e.g., `/tmp`, your home directory, etc.)

2. **Cross-Repository Operations**
   - Easily view PRs from different repositories
   - Great for code reviews across multiple projects
   - No need to have the repository configured locally

3. **Easy Sharing**
   - Share exact commands with PR URLs
   - Colleagues can run the same command regardless of their local setup
   - Works as long as they have configured bitbucket-cmd once

4. **Browser Integration**
   - Copy URL from browser and use directly in terminal
   - Seamless workflow between web UI and CLI

5. **Script Friendly**
   - Easy to automate PR operations
   - Use in CI/CD pipelines with PR URLs from webhooks
   - Single authentication setup works for all repositories

6. **No Repository Onboarding Required**
   - Only need global bitbucket-cmd configuration (done once)
   - Don't need to configure each repository individually
   - Perfect for reviewing PRs across many repositories

## Supported Commands with URL

Currently, the following commands support the `-u` / `--url` option:

- `--diffstat` - Show file change statistics
- `-d` / `--diff` - Show full diff

### Command Combinations

```bash
# Get diffstat using URL
bitbucket pr -u "<pr_url>" --diffstat

# Get diff using URL  
bitbucket pr -u "<pr_url>" -d

# Traditional method still works
bitbucket pr --diffstat 248
bitbucket pr -d 244
```

## Real-World Examples

### Example 1: Quick PR Review from ANY Directory
```bash
# Reviewer receives PR URL in Slack
# Can run from ANY directory - even /tmp!
cd /tmp
bitbucket pr -u "https://bitbucket.org/your-workspace/backend-service/pull-requests/156" --diffstat
```

### Example 2: Comparing Multiple PRs (No Directory Switching!)
```bash
# Check statistics for multiple PRs without ANY directory navigation
# Works from your home directory, /tmp, or anywhere!
cd ~
bitbucket pr -u "https://bitbucket.org/your-workspace/api-service/pull-requests/248" --diffstat
bitbucket pr -u "https://bitbucket.org/your-workspace/frontend-app/pull-requests/156" --diffstat
bitbucket pr -u "https://bitbucket.org/your-workspace/mobile-app/pull-requests/89" --diffstat
```

### Example 3: Scripting PR Statistics (From Anywhere!)
```bash
#!/bin/bash
# Script to check multiple PRs - runs from ANY directory!
PR_URLS=(
  "https://bitbucket.org/your-workspace/api-service/pull-requests/248"
  "https://bitbucket.org/your-workspace/frontend-app/pull-requests/156"
)

for url in "${PR_URLS[@]}"; do
  echo "Checking PR: $url"
  bitbucket pr -u "$url" --diffstat
  echo "---"
done
```

### Example 4: Non-Configured Repository Review
```bash
# Review PRs from repositories you've never cloned or configured
# Only requires bitbucket-cmd to be configured once (in any repo)
cd /tmp
bitbucket pr -u "https://bitbucket.org/your-workspace/new-project/pull-requests/1" --diffstat
# Works immediately! No need to clone or configure new-project
```

## Error Handling

If the URL cannot be parsed, you'll see an error message:

```bash
bitbucket pr -u "https://invalid-url.com/something" --diffstat
# Output:
# Error: Could not parse URL. Please provide a valid Bitbucket PR URL.
```

If neither URL nor PR number is provided:

```bash
bitbucket pr --diffstat
# Output:
# Error: Please provide either a PR number (--diffstat <pr_num>) or a PR URL (-u <url>)
```

## Technical Details

### URL Parsing
The tool uses regular expressions to extract:
- Workspace name (e.g., `your-workspace`)
- Repository slug (e.g., `your-repo`)
- PR number (e.g., `248`)

### Override Behavior
When `-u` is provided, the workspace and repository from the URL override the current directory's configuration. The authentication credentials still come from your configured settings.

### Supported URL Patterns
```regex
bitbucket\.org\/([^\/]+)\/([^\/]+)\/pull-requests\/(\d+)
api\.bitbucket\.org\/2\.0\/repositories\/([^\/]+)\/([^\/]+)\/pullrequests\/(\d+)
```

## Tips

1. **Use with Quotes**: Always wrap URLs in quotes to prevent shell interpretation
   ```bash
   bitbucket pr -u "https://..." --diffstat  # Good
   bitbucket pr -u https://... --diffstat    # May fail with special characters
   ```

2. **Tab Completion**: Your shell may support tab completion for long commands

3. **Aliases**: Create shell aliases for common operations
   ```bash
   alias bb-diffstat='bitbucket pr -u'
   # Usage: bb-diffstat "https://..." --diffstat
   ```

4. **Browser Extensions**: Use browser extensions to copy PR URLs in custom formats

## Future Enhancements

Potential future additions:
- Support for more commands (approve, merge, decline, etc.) with URL
- Batch operations on multiple PR URLs
- URL parsing from clipboard
- Interactive mode to select PR from list

## See Also

- [DIFFSTAT_USAGE.md](./DIFFSTAT_USAGE.md) - Complete diffstat documentation
- [README.md](./README.md) - Main documentation
