# Recent Enhancements

## 1. Improved Diffstat Visibility

### Issue
Blue text in alternating rows was hard to see on dark terminal backgrounds.

### Solution
Changed alternating row colors from `blue/yellow` to `white/yellow` for better visibility on dark terminals.

### Before
- Blue text (hard to see on dark backgrounds)
- Yellow text

### After
- White text (clearly visible)
- Yellow text

## 2. Meld Integration for Diff Viewing

### Feature
Added ability to open PR diffs in Meld tool for better visual comparison.

### Usage
```bash
# Open diff in Meld
bitbucket pr -d <pr_num> --meld

# With URL
bitbucket pr -u "https://bitbucket.org/workspace/repo/pull-requests/123" -d --meld
```

### How It Works
1. Fetches the diff from Bitbucket API
2. Parses the unified diff format
3. Creates temporary files for "before" and "after" versions
4. Opens each changed file in Meld for side-by-side comparison
5. Temporary files are stored in `/tmp/bitbucket-pr-{pr_number}/`

### Prerequisites
Meld must be installed on your system:

**macOS**:
```bash
brew install meld
```

**Linux**:
```bash
# Ubuntu/Debian
sudo apt install meld

# Fedora/RHEL
sudo dnf install meld
```

### Benefits
- **Visual Comparison**: Side-by-side view of changes
- **Syntax Highlighting**: Better code readability
- **Navigation**: Easy navigation between changes
- **Merge Tool**: Use Meld's powerful merge capabilities
- **Better for Large Diffs**: Easier to understand complex changes

### Examples

**Quick Review with Meld**:
```bash
cd /tmp
bitbucket pr -u "https://bitbucket.org/your-workspace/your-repo/pull-requests/244" -d --meld
```

**Compare Multiple Files**:
For PRs with multiple file changes, Meld will open a separate window for each file.

**Fallback Behavior**:
If Meld is not installed or encounters an error, the command will fall back to displaying the diff in the terminal.

## 3. Combined Workflow

### Review Statistics First, Then Diff
```bash
# 1. Check what files changed
bitbucket pr -u "https://..." --diffstat

# 2. If changes look interesting, open in Meld
bitbucket pr -u "https://..." -d --meld
```

### All-in-One Review
```bash
# Get stats AND open in Meld
PR_URL="https://bitbucket.org/your-workspace/your-repo/pull-requests/244"

echo "=== Checking Statistics ==="
bitbucket pr -u "$PR_URL" --diffstat

echo -e "\n=== Opening in Meld ==="
bitbucket pr -u "$PR_URL" -d --meld
```

## Technical Details

### Files Modified
1. **`lib/bitbucket/pr.js`**
   - Changed diffstat colors from `blue/yellow` to `white/yellow`
   - Added `parseDiffToFiles()` function to parse unified diffs
   - Updated `diff()` function to support `--meld` flag
   - Added file creation and Meld launching logic

2. **`bin/bitbucket.js`**
   - Added `--meld` command-line option

### Diff Parsing
The tool parses unified diff format and extracts:
- File names
- Before content (lines starting with `-`)
- After content (lines starting with `+`)
- Context lines (lines starting with space)

### Temporary Files
Files are created in `/tmp/bitbucket-pr-{pr_number}/` with naming:
- `before_{filename}` - Original version
- `after_{filename}` - Modified version

Example:
```
/tmp/bitbucket-pr-244/
├── before_api_cancel.js
└── after_api_cancel.js
```

## Quick Reference

### Diffstat (Improved Colors)
```bash
# Now shows white/yellow instead of blue/yellow
bitbucket pr --diffstat 244
bitbucket pr -u "https://..." --diffstat
```

### Diff with Meld
```bash
# Traditional method
bitbucket pr -d 244 --meld

# URL method (works from anywhere!)
bitbucket pr -u "https://bitbucket.org/team/repo/pull-requests/123" -d --meld
```

### Help
```bash
bitbucket pr --help
# Look for:
# -d, --diff [pr_num]    Diff Pull Request (optional with -u)
# --meld                 Open diff in Meld tool (use with -d or --diff)
```

## Troubleshooting

### "Meld not found"
Install Meld:
```bash
# macOS
brew install meld

# Linux
sudo apt install meld  # Ubuntu/Debian
```

### Colors still not visible
Try adjusting your terminal theme or colors:
- Use a dark theme with good contrast
- Adjust terminal color settings
- Try a different terminal emulator

### Meld doesn't open
Check if Meld is in your PATH:
```bash
which meld
```

If not found, you may need to create a symlink or add it to PATH.

### Multiple Meld windows
This is expected behavior for PRs with multiple files. Each file gets its own Meld window for comparison.

## Future Enhancements

Potential future improvements:
- Support for other diff tools (Beyond Compare, KDiff3, etc.)
- Configurable diff tool preference
- Option to open all files in one Meld window (directory comparison)
- Cleanup temporary files automatically
- Color scheme customization for diffstat
