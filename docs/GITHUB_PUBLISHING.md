# GitHub publishing

## Current state

The owner confirmed the public destination on 2026-10-02:
[NeuroScope](https://github.com/crockettetenebrusojd89-dev/NeuroScope).
The repository was created empty; the original local history is preserved.
The procedure below applies to initial publication and subsequent maintenance.
Check GitHub Actions and Releases for the current remote status.

## Choose the target and publish the code

1. Sign in to the intended GitHub account. Create the repository with the desired
   name and visibility. Start it empty (no generated README/license/gitignore),
   because these files and Git history already exist here.
2. Copy its actual HTTPS/SSH URL. Verify both owner and repository name.
3. From this project root, review the clean status and history:

```sh
git status --short
git log --oneline -15
git remote -v
```

4. Only when the destination is confirmed, replace the placeholder below:

```sh
git remote add origin https://github.com/crockettetenebrusojd89-dev/NeuroScope.git
git remote -v
git ls-remote --heads origin
git push -u origin main
```

Do not use force-push. If a remote already exists by this time, inspect it rather
than adding or replacing it. If the destination has unrelated commits, reconcile
that deliberately before pushing; do not overwrite them.

5. Review the Actions checks on GitHub, including Linux and Windows jobs. Local
   passing checks and a valid workflow are not a successful remote Actions run.
6. Set the repository description to "An interactive deep learning visualization laboratory built with NumPy, FastAPI and vanilla JavaScript." and choose a few accurate topics such as `deep-learning`,
   `numpy`, `education`, `visualization`, `fastapi`. No fake popularity badges.
7. Replace the temporary no-remote wording in README Quick Start/Publishing with
   the actual clone URL and repository state, in a small documentation commit.

## Tag and GitHub Release — later, intentionally

After reviewing the public repository and passing remote CI:

- Finalize the release date/status in CHANGELOG and release notes; commit it.
- Create and push the annotated tag deliberately:

```sh
git tag -a v0.3.0 -m "NeuroScope v0.3.0"
git push origin v0.3.0
```

- In GitHub's Releases page, select that existing tag, use
  [prepared release notes](RELEASE_NOTES_v0.3.0.md), review, then publish.
- Attach only real assets as needed; GitHub automatically provides source archives.
- Add a Live Demo link only after a deployed app is actually verified.

Website deployment is outside this publication task. GIF recording is already
completed; the three included demos do not need to be recorded again.
