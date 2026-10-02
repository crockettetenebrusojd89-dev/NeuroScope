# v0.3.0 release-preparation validation

## Baseline (independently rechecked)

- Starting HEAD: `86c651a`; original worktree clean, no remote configured.
- Prior i18n baseline remains `0464a17` in the preserved history.
- Python: 106 passed in 0.80 s.
- Frontend: 26 JS syntax checks; 298 aligned locale keys/placeholders; four routing assertions.
- Live HTTP: 28 POST checks, 23 successful / five expected localized 400;
  health/no-cache and finite values passed.
- Real browser: 18 existing labs in bilingual mode; zero visible errors,
  NaN/Infinity/undefined or console errors.

## Completed changes

Learning Path home, three existing-lab routes, official CS231n topic companions,
mobile navigation, product README, real screenshots/GIFs, release/publishing/
deployment guides, and CI alignment. No new DL lab or architecture rewrite.

## Final verification

Final clean-copy installation, browser matrix, test timings and asset checks are
recorded below when the release preparation is completed. No remote CI/cloud
success is claimed by this local work.
