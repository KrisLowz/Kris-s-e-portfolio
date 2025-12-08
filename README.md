<!-- <div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1s3B32V8ka9CG5WwcAfrtacdSbruyeqW0 -->

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

<!-- ### Using Local Images (Recommended for production)

For images that must load correctly on your live site, put them in the `public/assets` folder. Files in `public` are served statically at the website root, so they will work in both local dev and production builds.

- **Place the image:** add your files under `public/assets/`, e.g. `public/assets/TrackPoint.png`.
- **Reference the image in code:** use an absolute path from the site root, e.g. `/assets/TrackPoint.png`.

Example (in `src/constants.ts`):

```ts
image: "/assets/TrackPoint.png",
```

If you prefer bundling images with the app (not in `public`), keep them in `src/assets` and import them directly in components. Bundled imports are resolved by Vite during build, but paths like `src/assets/...` in runtime strings will not work on deployed hosts. -->

