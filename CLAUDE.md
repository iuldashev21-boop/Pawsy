# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pawsy is a dog health app built with React and Vite.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Tech Stack

- **React 19** with Vite 7
- **Tailwind CSS v4** - configured via `@tailwindcss/vite` plugin
- **Framer Motion** - animations
- **Lucide React** - icons

## Architecture

- `src/main.jsx` - App entry point
- `src/App.jsx` - Root component
- `src/index.css` - Global styles (Tailwind import)
- `vite.config.js` - Vite config with React and Tailwind plugins
