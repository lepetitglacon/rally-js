import bpy
import mathutils
import json, os, sys
from bpy.types import Operator
from bpy_extras.io_utils import ExportHelper
from bpy.props import IntProperty, BoolProperty, FloatProperty

from . import utils  # helpers like curve_to_points


class EXPORT_SCENE_OT_TerrainAndSpline(Operator, ExportHelper):
    bl_idname = "export_scene.terrain_spline"
    bl_label = "Rally Terrain and Spline Export"

    filename_ext = ".json"

    resolution: IntProperty(
        name="Heightmap Resolution",
        description="Output image size (square)",
        default=128,
        min=16,
        max=4096
    )
    normalize: BoolProperty(
        name="Normalize Heights",
        description="Map min height=0 and max=255",
        default=True
    )
    scale: FloatProperty(
        name="Spline Scale",
        description="Export scaling factor for spline",
        default=1.0
    )

    def execute(self, context):
        folder = os.path.dirname(self.filepath)

        # --- Terrain heightmap ---
        obj = bpy.context.scene.objects.get('Terrain')
        if obj:
            filepath = os.path.join(folder, f"{obj.name}_heightmap.png")
            render_heightmap(obj, filepath, resolution=self.resolution)

        # --- Spline export ---
        spline = bpy.context.scene.objects.get('Spline')
        if spline:
            points = utils.curve_to_points(spline, scale=self.scale)
            path = os.path.join(folder, f"{spline.name}_spline.json")
            with open(path, "w") as f:
                json.dump(points, f)

        return {'FINISHED'}


def render_heightmap(obj, filepath, resolution=512):
    """
    Render a heightmap of `obj` to `filepath` using orthographic top-down render.
    Height is normalized from min_z -> 0 to max_z -> 1.
    """

    # compute bounding box
    bbox = [obj.matrix_world @ mathutils.Vector(c) for c in obj.bound_box]
    min_x = min(v.x for v in bbox)
    max_x = max(v.x for v in bbox)
    min_y = min(v.y for v in bbox)
    max_y = max(v.y for v in bbox)
    min_z = min(v.z for v in bbox)
    max_z = max(v.z for v in bbox)
    size = max(max_x - min_x, max_y - min_y)

    print(f"Limites X: {min_x:.3f} à {max_x:.3f} (largeur: {max_x - min_x:.3f})")
    print(f"Limites Y: {min_y:.3f} à {max_y:.3f} (hauteur: {max_y - min_y:.3f})")
    print(f"Limites Z: {min_z:.3f} à {max_z:.3f} (profondeur: {max_z - min_z:.3f})")

    # store original materials
    old_mats = obj.data.materials[:]

    # create temporary height material
    mat = bpy.data.materials.new(name="HeightMat")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    emission = nodes.new("ShaderNodeEmission")
    geom = nodes.new("ShaderNodeNewGeometry")
    map_range = nodes.new("ShaderNodeMapRange")
#     map_range.inputs['From Min'].default_value = min_z
#     map_range.inputs['From Max'].default_value = max_z
    map_range.inputs['From Min'].default_value = 0
    map_range.inputs['From Max'].default_value = 300
    map_range.inputs['To Min'].default_value = 0.0
    map_range.inputs['To Max'].default_value = 1.0

    links.new(geom.outputs['Position'], map_range.inputs['Value'])
    links.new(map_range.outputs['Result'], emission.inputs['Color'])
    links.new(emission.outputs['Emission'], output.inputs['Surface'])

    # assign material
    obj.data.materials.clear()
    obj.data.materials.append(mat)

    # create orthographic camera
    cam_data = bpy.data.cameras.new("HeightmapCam")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = size
    cam_obj = bpy.data.objects.new("HeightmapCamObj", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    cam_obj.location = ((min_x+max_x)/2, (min_y+max_y)/2, max_z + 1.0)
    cam_obj.rotation_euler = (0, 0, 0)
    bpy.context.scene.camera = cam_obj

    # store names before render for safe cleanup
    cam_name = cam_obj.name or ''
    cam_data_name = cam_data.name
    mat_name = mat.name

    # render settings
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = resolution
    scene.render.resolution_y = resolution
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = filepath

    # render
    bpy.ops.render.render(write_still=True)

    # restore old materials
    obj.data.materials.clear()
    for m in old_mats:
        obj.data.materials.append(m)

    # safe cleanup
    cam_obj = bpy.data.objects.get(cam_name)
    if cam_obj:
        bpy.data.objects.remove(cam_obj, do_unlink=True)
    cam_data_obj = bpy.data.cameras.get(cam_data_name)
    if cam_data_obj:
        bpy.data.cameras.remove(cam_data_obj)
    mat_obj = bpy.data.materials.get(mat_name)
    if mat_obj:
        bpy.data.materials.remove(mat_obj)


def menu_func_export(self, context):
    self.layout.operator(EXPORT_SCENE_OT_TerrainAndSpline.bl_idname,
                         text="Terrain + Spline Export (.json)")


def register():
    bpy.utils.register_class(EXPORT_SCENE_OT_TerrainAndSpline)
    bpy.types.TOPBAR_MT_file_export.append(menu_func_export)


def unregister():
    bpy.utils.unregister_class(EXPORT_SCENE_OT_TerrainAndSpline)
    bpy.types.TOPBAR_MT_file_export.remove(menu_func_export)