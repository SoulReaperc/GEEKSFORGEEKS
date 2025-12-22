# Contributing to GEEKSFORGEEKS-SRMIST

Thank you for your interest in contributing to the GFG SRMIST website! This document provides guidelines for contributing.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Set up environment variables** (see README.md for required variables)
4. **Run the development server**: `npm run dev`

## Development Workflow

### Branching

- Create feature branches from `dev/` 
- Use descriptive branch names: `feature/add-event-page`, `fix/navbar-styling`, `docs/update-readme`

### Making Changes

1. Keep commits small and focused on a single change
2. Write clear, descriptive commit messages
3. Run `npm run lint` before committing to ensure code quality
4. Test your changes locally before submitting

### Code Style

- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Follow Tailwind CSS conventions for styling
- Keep components modular and reusable

## Submitting Changes

### Pull Requests

1. Push your branch to your fork
2. Open a pull request against the `dev/` branch
3. Fill out the PR template with a clear description of changes
4. Link any related issues
5. Wait for review and address any feedback

### PR Guidelines

- Keep PRs focused on a single feature or fix
- Include screenshots for UI changes
- Ensure all linting passes
- Update documentation if needed

## Reporting Issues

- Use the issue templates for bug reports and feature requests
- Search existing issues before creating a new one
- Provide as much detail as possible

## Project Structure

- `app/` — Next.js routes & server components
- `app/components/` — Reusable UI components
- `app/admin/` — Admin dashboard pages
- `lib/` — Helper functions for Contentful & Supabase
- `public/` — Static assets

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (auth & database)
- **CMS**: Contentful
- **Animations**: GSAP, Three.js

## Need Help?

- Check the [README](README.md) for setup instructions
- Review existing issues and PRs for context
- Reach out to maintainers if you're stuck

## Code of Conduct

Be respectful and inclusive. We're all here to learn and build together as part of the GFG SRMIST community.

---

Thank you for contributing! 🎉
