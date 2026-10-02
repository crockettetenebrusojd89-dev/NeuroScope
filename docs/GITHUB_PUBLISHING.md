# GitHub publishing — owner steps

## Current state

The original working repository has **no remote configured**. No account or
repository name has been guessed. All existing history is preserved; no push,
public repository, tag, or GitHub Release has been created by this work.

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
git remote add origin https://github.com/OWNER/REPOSITORY.git
git remote -v
git ls-remote --heads origin
git push -u origin main
```

Do not use force-push. If a remote already exists by this time, inspect it rather
than adding or replacing it. If the destination has unrelated commits, reconcile
that deliberately before pushing; do not overwrite them.

5. Review the Actions checks on GitHub, including Linux and Windows jobs. Local
   passing checks and a valid workflow are not a successful remote Actions run.
6. Set the repository description to "Interactive deep learning visualization
   laboratory" and choose a few accurate topics such as `deep-learning`,
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

These owner decisions remain because the destination account/repository and
public hosting account are not specified. GIF recording is already completed;
you do not need to record the three included demos manually.
