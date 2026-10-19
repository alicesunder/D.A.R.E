# D.A.R.E. Phase 7 — Fix broken learning-media images

## Root cause
The three learning-media cards referenced image paths containing Thai filenames:
- `/images/media-รู้จักยาเสพติด.png`
- `/images/media-ทักษะการปฏิเสธ.png`
- `/images/media-เพื่อนดี.png`

In the ZIP, those filenames were stored/extracted with corrupted character encoding. On Windows, the resulting paths may not match the paths referenced by the app, so the browser displays the broken-image icon and alt text.

## Fix applied
- Renamed the three image assets to stable ASCII filenames:
  - `public/images/media-drug-awareness.png`
  - `public/images/media-refusal.png`
  - `public/images/media-friendship.png`
- Updated code references from the Thai filenames to these stable paths.
- Preserved the rest of the latest Phase 7 project files.
- Added this report for future continuity.

## Verification
- ZIP integrity checked after packaging.
- Source references checked to confirm no old media paths remain.
- Browser runtime was not available in this packaging step; verify the cards in the local dev server after extracting this ZIP.
