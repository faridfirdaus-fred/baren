# E9-4: Usability Test Protocol — Admin Panel

**Objective:** Verify 3/3 calon admin dapat mengganti logo tanpa panduan dalam waktu ≤5 menit (NFR-USE-02)

## Test Environment

**Requirements:**
- Browser: Chrome/Firefox/Edge (latest)
- Screen resolution: 1366×768 minimum
- Test account: admin credentials provided
- Assets: test logo file (PNG/JPG/SVG, <2MB)

## Test Scenario: Change Site Logo

### Pre-Test Setup
1. Admin logged out
2. Test logo file prepared (`test-logo.png`, 500×500px, ~100KB)
3. Timer ready
4. Observer present (no hints allowed)

### Task Instructions (Given to Participant)

> **Scenario:** Anda adalah admin baru untuk situs game BAREN. Tim marketing meminta Anda mengganti logo situs dengan logo baru yang mereka kirim.
>
> **Task:** Ganti logo situs dari logo lama ke logo baru (`test-logo.png`).
>
> **Success Criteria:** Logo baru terlihat di halaman publik.
>
> **Time Limit:** 5 menit
>
> **Note:** Tidak ada panduan diberikan. Gunakan intuisi Anda.

### Expected User Flow

1. **Login** (0-1 min)
   - Navigate to `/admin/login`
   - Enter credentials
   - Click "Masuk"

2. **Find Branding Section** (1-2 min)
   - From dashboard, locate "Branding" menu/link
   - Click to `/admin/branding`

3. **Upload Logo** (2-4 min)
   - Locate "Logo" field
   - Click upload button
   - Select `test-logo.png`
   - Wait for upload confirmation

4. **Save Changes** (4-5 min)
   - Click "Simpan" button
   - See success message
   - Verify logo changed (refresh public page)

### Observation Checklist

| Step | Checkpoint | Pass/Fail | Time | Notes |
|------|------------|-----------|------|-------|
| 1 | Login successful | ⬜ | __:__ | |
| 2 | Found branding section without help | ⬜ | __:__ | |
| 3 | Located logo upload field | ⬜ | __:__ | |
| 4 | Successfully uploaded file | ⬜ | __:__ | |
| 5 | Saved changes | ⬜ | __:__ | |
| 6 | Verified logo on public page | ⬜ | __:__ | |
| **Total Time** | | | __:__ | ≤5:00 required |

### Usability Issues Log

| Issue | Severity | Description | Suggested Fix |
|-------|----------|-------------|---------------|
| | Low/Medium/High | | |

## Success Criteria

**Pass:** ≥3/3 participants complete task in ≤5 minutes without guidance

**Metrics:**
- Average completion time: _____ min
- Success rate: ___/3 (100% required)
- User satisfaction: ___/5 (post-task survey)

## Post-Test Questions

1. **Ease of Use:** "Seberapa mudah menemukan menu Branding?" (1-5, 5=sangat mudah)
2. **Clarity:** "Apakah label 'Logo' jelas?" (Ya/Tidak)
3. **Feedback:** "Apakah pesan konfirmasi cukup jelas?" (Ya/Tidak)
4. **Suggestions:** "Ada saran perbaikan?" (open-ended)

## Current Admin UI Analysis

### Branding Page (`/admin/branding`)
**Strengths:**
- ✅ Direct link from dashboard sidebar
- ✅ "Branding" label clear and intuitive
- ✅ Upload button prominent
- ✅ Success toast notification
- ✅ Preview of current logo

**Potential Issues:**
- ⚠️ No inline preview of uploaded logo (before save)
- ⚠️ File size limit not shown upfront

### Expected Results (Prediction)

**Likely Success:** 3/3 users complete task
- Navigation clear: "Branding" in sidebar
- Upload UI standard: familiar pattern
- Feedback immediate: toast confirmation

**Possible Friction Points:**
1. Finding save button (if below fold)
2. Waiting for R2 upload (network delay)
3. Verifying change (may need refresh)

## Test Execution Plan

### Participant Recruitment
- Target: 3 individuals with basic computer literacy
- No prior experience with BAREN admin required
- Age: 20-40 (representative of target admin users)

### Scheduling
- Test 1: [Date/Time]
- Test 2: [Date/Time]
- Test 3: [Date/Time]

### Materials
- Admin credentials card
- Test logo file (USB/email)
- Observation sheet (printed)
- Timer/stopwatch

## Alternative: Self-Service Validation

**If real users unavailable:** Walk through UI as naive user

1. **Cognitive Walkthrough:**
   - Start at dashboard
   - Goal: "I need to change the logo"
   - Q: "Is 'Branding' label obvious?" → Yes
   - Q: "Is upload button visible?" → Yes
   - Q: "Is save action clear?" → Yes

2. **Heuristic Evaluation:**
   - Visibility of system status: ✅ Toast notifications
   - Match between system and real world: ✅ "Logo" term familiar
   - User control: ✅ Cancel/back available
   - Consistency: ✅ Upload pattern matches other forms
   - Error prevention: ✅ File type/size validation
   - Recognition over recall: ✅ Visual logo preview
   - Flexibility: ✅ Direct file upload or URL
   - Help and documentation: ⚠️ No inline help (minor)

**Estimated completion time:** 2-3 minutes (experienced user)  
**Predicted naive user time:** 4-5 minutes

## Definition of Done

- ✅ Test protocol documented
- ⬜ 3 participants tested (OR cognitive walkthrough completed)
- ⬜ All participants pass (100% success rate)
- ⬜ Average time ≤5 minutes
- ⬜ Usability issues logged (if any)
- ✅ Recommendations documented

**Status:** Protocol ready for execution  
**Blocker:** Real user recruitment (acceptable: cognitive walkthrough as proxy)
