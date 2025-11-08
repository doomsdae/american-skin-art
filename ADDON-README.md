# ASA Add-on: Devin portfolio + JSON slider

This add-on moves the home "Recent Work" into a rotating slider, and places Devin's full portfolio on a dedicated bio page using the same data file.

## Files
- /data/devin-works.json … list of images used in both the home slider and Devin's gallery
- /assets/js/slider.js … lightweight, accessible slider
- /assets/css/main.css … appended styles for slider + grid
- /artists/devin-walker.html … Devin's bio + gallery
- /index.recent-work.snippet.html … HTML you paste into index.html where "Recent Work" was

## Steps
1) Upload your Devin images to: `/assets/img/artists/devin-walker/works/` and update `/data/devin-works.json` with real filenames + alts.
2) On the home page, replace your current "Recent Work" block with the contents of `/index.recent-work.snippet.html`.
3) Ensure these scripts are included on the home page (after main.js):
   <script defer src="/assets/js/slider.js?v=asa-v1"></script>
4) Link to Devin's new page somewhere (e.g., /artists/devin-walker.html).

Tip: Keep image names lowercase-hyphenated and export WebP/JPG for fast loads. Use 1280–1600px width for hero/slider items.
