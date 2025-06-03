# Canonical URL Fix Instructions

## Issue Identified
Based on the Google Search Console report in `issue/todayeggrates_03-jun-2025_non-canonical-page_2025-06-03_15-03-25.csv`, all webstory pages are incorrectly pointing to the same canonical URL (`https://todayeggrates.com/`) instead of their own unique URLs.

## Root Cause
The webstory template was using an incorrect URL pattern:
- **Wrong**: `https://todayeggrates.com/webstories/{{CITY_SLUG}}-egg-rate.html`
- **Correct**: `https://todayeggrates.com/webstory/{{CITY_SLUG}}`

## Files Fixed Locally
1. ✅ `public/templates/webstory_template.html` - Fixed canonical URL and Open Graph URL
2. ✅ `build/templates/webstory_template.html` - Fixed canonical URL and Open Graph URL

## What You Need to Do on Hostinger

### Step 1: Upload Fixed Template
Upload the corrected `webstory_template.html` file to your Hostinger server:
```
/public_html/templates/webstory_template.html
```

### Step 2: Regenerate All Webstories
Run the webstory generation script on your Hostinger server to regenerate all webstory files with the correct canonical URLs:

```php
php /path/to/your/webstory_generation_script.php
```

### Step 3: Verify the Fix
After regeneration, check a few webstory files to ensure they have the correct canonical URL format:
- Should be: `<link rel="canonical" href="https://todayeggrates.com/webstory/city-name">`
- Should NOT be: `<link rel="canonical" href="https://todayeggrates.com/">`

### Step 4: Update Sitemap (if needed)
Make sure your sitemap reflects the correct URL structure for webstories.

### Step 5: Submit to Google Search Console
1. Submit the updated sitemap to Google Search Console
2. Request re-indexing of the webstory pages
3. Monitor the "Coverage" report to see when Google processes the fixed canonical URLs

## Expected Results
After this fix:
- Each webstory will have its own unique canonical URL
- Google will treat each webstory as a separate page instead of duplicate content
- The non-canonical page errors in Search Console should decrease over time
- Better SEO performance for individual city egg rate pages

## Template Changes Made

### Canonical URL Fixed
```html
<!-- Before (Wrong) -->
<link rel="canonical" href="https://todayeggrates.com/webstories/{{CITY_SLUG}}-egg-rate.html">

<!-- After (Correct) -->
<link rel="canonical" href="https://todayeggrates.com/webstory/{{CITY_SLUG}}">
```

### Open Graph URL Fixed
```html
<!-- Before (Wrong) -->
<meta property="og:url" content="https://todayeggrates.com/webstories/{{CITY_SLUG}}-egg-rate.html">

<!-- After (Correct) -->
<meta property="og:url" content="https://todayeggrates.com/webstory/{{CITY_SLUG}}">
```

## Timeline
- Google typically takes 1-2 weeks to re-crawl and process canonical URL changes
- Monitor Search Console for improvements in the "Coverage" and "Pages" reports
- The 423 inlinks mentioned in the CSV should start pointing to the correct canonical URLs

## Notes
- This fix addresses the core SEO issue where Google was seeing duplicate content
- Each webstory will now be treated as a unique page with its own ranking potential
- This should improve overall site performance in search results
