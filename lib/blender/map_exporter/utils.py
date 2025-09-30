import bpy
import numpy as np
from mathutils import Vector

def mesh_to_heightmap_png(obj, resolution=256):
    # compute bbox
    bbox = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    min_x = min(v.x for v in bbox)
    max_x = max(v.x for v in bbox)
    min_y = min(v.y for v in bbox)
    max_y = max(v.y for v in bbox)
    min_z = min(v.z for v in bbox)
    max_z = max(v.z for v in bbox)

    size_x = max_x - min_x
    size_y = max_y - min_y
    size = max(size_x, size_y)  # make square

    # create empty heightmap (float32 0..1)
    heightmap = np.zeros((resolution, resolution), dtype=np.float32)

    # get evaluated mesh
    depsgraph = bpy.context.evaluated_depsgraph_get()
    eval_obj = obj.evaluated_get(depsgraph)
    mesh = eval_obj.to_mesh()

    for i in range(resolution):
        for j in range(resolution):
            u = i / (resolution - 1)
            v = j / (resolution - 1)
            x = min_x + u * size
            y = min_y + v * size

            # raycast down
            origin = Vector((x, y, max_z + 1.0))
            direction = Vector((0, 0, -1))
            success, loc, normal, face_index = mesh.ray_cast(origin, direction)
            if success:
                heightmap[j, i] = (loc.z - min_z) / (max_z - min_z)  # normalized 0..1

    eval_obj.to_mesh_clear()

    # convert to RGBA for Blender image
    rgba = np.repeat(heightmap[:, :, np.newaxis], 4, axis=2)
    rgba[:, :, 3] = 1.0  # alpha
    pixels = rgba.flatten()

    # create Blender image
    img = bpy.data.images.new(f"{obj.name}_heightmap", width=resolution, height=resolution, float_buffer=True)
    img.pixels.foreach_set(pixels)
    img.file_format = 'PNG'
    img.filepath_raw = f"//{obj.name}_heightmap.png"

    return img

def curve_to_points(curve_obj):
    curve = curve_obj.data
    coords = []
    for spline in curve.splines:
        for p in spline.bezier_points:
            coords.append([p.co.x, p.co.y, p.co.z])
    return coords