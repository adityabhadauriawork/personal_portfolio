# Third-Party Asset Attribution & Licensing

This document details the licensing, source provenance, and creator attribution for third-party 3D assets used in the portfolio of **Aditya Pratap Singh Bhadauria**.

---

## 1. White Feline Companion 3D Character Model

- **Asset**: Toon Cat FREE (Rigged & Animated 3D Feline Model)
- **File Location**: `public/assets/portfolio/character/white-cat.glb`
- **Creator / Studio**: Omabuarts Studio ([https://sketchfab.com/omabuarts](https://sketchfab.com/omabuarts))
- **Source**: [Sketchfab 3D Models — Toon Cat FREE](https://sketchfab.com/3d-models/toon-cat-free-bdf02d90a12a45a3be1884fe08169e59)
- **License**: Creative Commons Attribution 4.0 International ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
- **Permitted Uses**: Personal and commercial projects, modification, distribution with proper attribution.
- **Modifications & Integration**:
  - Downloaded and converted to a self-contained, optimized binary glTF (`.glb`) asset stored locally inside the project.
  - Materials tuned for pearlescent alabaster white fur finish with emerald eyes and soft inner-ear tone.
  - Integrated into Three.js `AnimationMixer` with custom behavioral state machine:
    - Locomotion along a pearl-lavender visual guide path.
    - Deterministic state machine: `WALKING → SITTING → IDLE → STANDING → WALKING`.
    - Procedural breathing, eye blinking, attentive head orientation, and smooth 180° turns.
