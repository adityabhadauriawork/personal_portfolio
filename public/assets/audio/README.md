# Portfolio Custom Soundtrack Directory

Place your custom soundtrack audio file in this directory with the exact filename:

```
portfolio-theme.mp3
```

Full asset path:
`public/assets/audio/portfolio-theme.mp3`

## How to Activate Your Soundtrack

1. Copy your audio file into this folder and ensure it is named:
   `portfolio-theme.mp3`

2. Open `src/data/audioConfig.ts`.

3. Set `isSoundtrackUploaded` to `true`:
   ```ts
   export const audioConfig = {
     soundtrackPath: '/assets/audio/portfolio-theme.mp3',
     isSoundtrackUploaded: true, // <-- set to true once your file is in place
     ...
   };
   ```

4. Build or reload your site (`npm run build` or `npm run dev`).

The audio engine will automatically use `portfolio-theme.mp3` for the welcome music choice and navigation sound controls, complete with exponential fade-in, volume controls, and tab-visibility management.

