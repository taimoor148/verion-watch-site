# Watch model slot

Drop the real VÉRION timepiece here as:

    public/models/verion-watch.glb

The experience auto-detects the file at runtime. When present, it replaces
the procedural fallback watch completely.

Guidelines for best results:

- Format: glTF binary (.glb), uncompressed preferred (no Draco quantization —
  the loader does not bundle a decoder).
- Real-world proportions: case diameter roughly 40 units on import is ideal;
  the scene auto-normalizes scale and centers the model anyway.
- Orientation: dial facing +Z, crown toward +X, 12 o'clock toward +Y.
- Materials: use PBR metallic/roughness workflows; polished parts ~0.05-0.12
  roughness, brushed parts 0.3-0.45. The studio environment light rig will do
  the rest.
- Keep the file under ~8 MB for a fast premium load.

# Movement model slot

The `04 / THE MOVEMENT` act accepts its own model at:

    public/models/verion-movement.glb

When present it replaces the procedural Calibre V-1 (mainplate, bridges with
Geneva stripes, gear train, balance, rotor) during the movement act only.
Same format guidance as above; orientation: dial side facing +Z, and keep the
overall shape roughly flat so the camera can orbit across the scroll story.
