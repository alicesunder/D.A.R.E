# D.A.R.E. Phase 4 — Teacher photos integrated

This package includes the teacher directory code, photo mapping, and extracted teacher portrait assets.

## Photo integration
- Portrait files are stored in `public/teacher-photos/`.
- `src/data/teacherPhotoMap.json` maps each personnel `sourceRow` to its portrait URL.
- `src/pages/admin/PersonnelPage.tsx` reads that mapping and renders the portrait on each grid card.
- The map currently contains 235 mapped personnel records. The source workbook yielded 237 portrait files; records without a reliable mapping should retain the initials fallback rather than receive another person's photo.

## Run locally
1. Extract the entire ZIP to a new folder.
2. Open PowerShell in the folder containing `package.json`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

## Important
If the online site still shows initials, it is likely running an older deployed build. This ZIP does not update GitHub or Vercel automatically. Deploy this project folder through your normal workflow to publish these assets and code.
