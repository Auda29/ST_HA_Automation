# HACS Submission Checklist

This document tracks the requirements for submitting ST for Home Assistant to the HACS default repository.

## Requirements Status

### ✅ Completed

- [x] Repository is public and hosted on GitHub
- [x] Repository can be added to HACS as a custom repository
- [x] `hacs.json` file exists with required fields:
  - `name`: "ST for Home Assistant"
  - `render_readme`: true
  - `filename`: "st_hass"
  - `hacs`: "1.6.0"
  - `domains`: ["st_hass"]
  - `iot_class`: "Local Push"
  - `homeassistant`: "2024.1.0"
- [x] `info.md` created for HACS store page
- [x] `CHANGELOG.md` created and maintained
- [x] Release workflow (`.github/workflows/release.yml`) created
- [x] README is polished and user-friendly
- [x] All documentation is complete (tutorials, references, FAQ, troubleshooting)

### ⚠️ Pending Manual Steps

- [x] **GitHub Actions Setup**: HACS Action and Hassfest are present in CI
  - HACS Action: configured in `.github/workflows/ci.yml`
  - Hassfest: configured in `.github/workflows/ci.yml`
- [ ] **Create GitHub Release**: Create a full release (not just a tag) after actions pass
  - Current version: 2.0.1
  - Tag: `v2.0.1`
- [ ] **Repository Settings** (verify on GitHub):
  - [ ] Repository has a description
  - [ ] Issues are enabled
  - [ ] Topics are defined (e.g., "home-assistant", "hacs", "integration", "structured-text", "plc")
- [ ] **Brands Registration**: Add to `home-assistant/brands` repository
  - Required for integrations
  - PR to: https://github.com/home-assistant/brands
- [ ] **HACS Default Repository Submission**: Create PR to `hacs/default`
  - Fork `hacs/default` repository
  - Create new branch from master
  - Add entry to `./integration` file (alphabetically)
  - PR must be editable (not from organization account)
  - Fill out PR template correctly

### 📋 Submission Process

1. **Verify GitHub Actions**:
   ```yaml
   # Already present in .github/workflows/ci.yml
   - name: HACS Action
     uses: hacs/action@main
     with:
       category: integration
   
   - name: Hassfest
     uses: home-assistant/actions/hassfest@master
   ```

2. **Create GitHub Release**:
   - Go to GitHub repository → Releases → Create new release
   - Tag: `v2.0.1`
   - Title: "Release 2.0.1"
   - Description: Copy from CHANGELOG.md
   - Mark as "Latest release"

3. **Add to Brands Repository**:
   - Fork `home-assistant/brands`
   - Add entry for `st_hass` integration
   - Create PR

4. **Submit to HACS Default**:
   - Fork `hacs/default`
   - Create branch from master
   - Edit `./integration` file
   - Add entry alphabetically:
     ```json
     {
       "name": "ST for Home Assistant",
       "repository": "Auda29/ST_HA_Automation"
     }
     ```
   - Create PR with proper template filled out

## Notes

- Logo/icon assets are optional but recommended for better HACS store presentation
- Review process can take months (check backlog status)
- All automated checks must pass before PR will be reviewed
- PR must be editable (submit from personal account, not organization)

## Resources

- HACS Documentation: https://hacs.xyz/docs/publish/include
- HACS Default Repository: https://github.com/hacs/default
- Home Assistant Brands: https://github.com/home-assistant/brands
- HACS Backlog: https://github.com/hacs/default/issues
