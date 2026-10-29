/**
 * WebGL2 Immutable Texture Guard
 *
 * In WebGL2, calling texStorage2D / texStorage3D on a texture that already has
 * TEXTURE_IMMUTABLE_FORMAT = true generates a GL_INVALID_OPERATION error.
 * In Three.js r186, certain global LUT textures (such as DFG_LUT used for PBR specular)
 * and cloned texture properties can trigger redundant texStorage2D calls during
 * re-renders or context flushes.
 *
 * This safeguard checks if the currently bound texture is already immutable before
 * invoking texStorage2D/3D, safely eliding the illegal re-allocation while allowing
 * subsequent texSubImage2D calls to proceed normally.
 */

if (typeof window !== 'undefined' && typeof WebGL2RenderingContext !== 'undefined') {
  const origTexStorage2D = WebGL2RenderingContext.prototype.texStorage2D;
  WebGL2RenderingContext.prototype.texStorage2D = function(
    target: number,
    levels: number,
    internalformat: number,
    width: number,
    height: number
  ) {
    try {
      if (this.getTexParameter(target, this.TEXTURE_IMMUTABLE_FORMAT)) {
        return;
      }
    } catch {
      // Fallback to original if getTexParameter fails for any reason
    }
    return origTexStorage2D.call(this, target, levels, internalformat, width, height);
  };

  const origTexStorage3D = WebGL2RenderingContext.prototype.texStorage3D;
  WebGL2RenderingContext.prototype.texStorage3D = function(
    target: number,
    levels: number,
    internalformat: number,
    width: number,
    height: number,
    depth: number
  ) {
    try {
      if (this.getTexParameter(target, this.TEXTURE_IMMUTABLE_FORMAT)) {
        return;
      }
    } catch {
      // Fallback to original
    }
    return origTexStorage3D.call(this, target, levels, internalformat, width, height, depth);
  };
}
