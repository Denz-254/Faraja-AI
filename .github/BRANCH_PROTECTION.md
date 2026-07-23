# Optional: block merges until CI is green.
# In GitHub → Settings → Branches → Add rule for `main`:
#   - Require a pull request before merging
#   - Require status checks to pass: Backend lint & test, Frontend lint & build
#   - Do not allow bypassing
#
# Direct pushes to main will still be possible unless "Restrict who can push" is enabled.
# Prefer PRs so GitHub Actions can reject bad code before merge.

version: "1"
