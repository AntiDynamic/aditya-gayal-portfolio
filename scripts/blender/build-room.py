import bpy
import os
import math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
materials = {}
for name, color in {"plaster": (0.57, 0.56, 0.51, 1), "paint": (0.17, 0.26, 0.28, 1), "floor": (0.24, 0.25, 0.23, 1), "trim": (0.30, 0.32, 0.30, 1), "steel": (0.18, 0.20, 0.19, 1), "cream": (0.74, 0.70, 0.58, 1), "rubber": (0.045, 0.048, 0.04, 1), "wood": (0.37, 0.28, 0.18, 1), "diffuser": (0.82, 0.83, 0.79, 1)}.items():
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = 0.82
    materials[name] = material

def box(name, position, dimensions, material, bevel=0.008):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(position[0], -position[2], position[1]))
    item = bpy.context.object
    item.name = name
    item.dimensions = (dimensions[0], dimensions[2], dimensions[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    item.data.materials.append(materials[material])
    if bevel:
        modifier = item.modifiers.new("soft_edges", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return item

box("floor", (0, -0.08, 0), (6.4, 0.16, 5.6), "floor")
box("back_wall", (0, 1.575, -2.85), (6.6, 3.15, 0.12), "plaster")
box("right_wall", (3.25, 1.575, 0), (0.12, 3.15, 5.6), "plaster")
box("front_wall", (0, 1.575, 2.85), (6.6, 3.15, 0.12), "plaster")
box("window_wall_low", (-3.25, 0.52, 0), (0.12, 1.04, 5.6), "plaster")
box("window_wall_high", (-3.25, 2.94, 0), (0.12, 0.42, 5.6), "plaster")
box("window_wall_back", (-3.25, 1.9, -2.14), (0.12, 1.8, 1.32), "plaster")
box("window_wall_front", (-3.25, 1.9, 2.1), (0.12, 1.8, 1.4), "plaster")
box("ceiling", (0, 3.2, 0), (6.5, 0.1, 5.7), "plaster")
for depth in [-2.779, 2.779]:
    box("lower_wall_paint", (0, 0.47, depth), (6.35, 0.94, 0.008), "paint", 0)
    box("paint_rail", (0, 0.945, depth), (6.35, 0.012, 0.018), "trim", 0.003)
for width in [-3.179, 3.179]:
    box("lower_wall_paint", (width, 0.47, 0), (0.008, 0.94, 5.5), "paint", 0)
    box("paint_rail", (width, 0.945, 0), (0.018, 0.012, 5.5), "trim", 0.003)
box("service_conduit", (0.08, 2.91, -2.767), (5.95, 0.023, 0.033), "steel", 0.004)
for width in [-2.35, -0.8, 0.75, 2.3]:
    box("conduit_clip", (width, 2.91, -2.739), (0.032, 0.048, 0.018), "trim", 0.002)
box("service_hatch", (2.41, 2.59, -2.747), (0.42, 0.34, 0.026), "trim", 0.006)
box("hatch_inset", (2.41, 2.59, -2.726), (0.34, 0.26, 0.012), "steel", 0.004)
for vent in range(5):
    box("vent_slot", (2.41, 2.50 + vent * 0.035, -2.716), (0.25, 0.008, 0.004), "rubber", 0)
box("window_sill", (-3.09, 1.04, -0.04), (0.43, 0.065, 2.95), "cream")
for depth in [-1.51, -0.05, 1.41]:
    box("window_vertical", (-3.19, 1.88, depth), (0.065, 1.7, 0.06), "trim")
for height in [1.08, 2.72]:
    box("window_horizontal", (-3.19, height, -0.05), (0.065, 0.07, 2.98), "trim")
for depth in [-2.77, 2.77]:
    box("skirting", (0, 0.065, depth), (6.4, 0.13, 0.03), "trim")
for width in [-3.17, 3.17]:
    box("skirting", (width, 0.065, 0), (0.03, 0.13, 5.6), "trim")
box("door", (1.95, 1.06, 2.77), (0.94, 2.12, 0.045), "wood")
for width in [1.45, 2.45]:
    box("door_frame", (width, 1.1, 2.72), (0.055, 2.2, 0.1), "trim")
box("door_lintel", (1.95, 2.19, 2.72), (1.05, 0.07, 0.1), "trim")
box("door_handle", (1.59, 1.02, 2.68), (0.13, 0.025, 0.04), "steel")
box("fluorescent_mount", (0, 3.10, 0.7), (1.56, 0.10, 0.32), "steel")
box("tube_backing", (0, 3.035, 0.7), (1.4, 0.025, 0.26), "cream")
box("diffuser", (0, 2.998, 0.7), (1.37, 0.018, 0.255), "diffuser", 0.008)
for edge in [-0.736, 0.736]:
    box("fixture_clip", (edge, 3.016, 0.7), (0.023, 0.029, 0.285), "trim", 0.002)
box("pinboard_back", (0.9, 1.62, -2.76), (1.38, 0.96, 0.06), "wood")
box("storage_left", (2.39, 0.47, 1.42), (0.03, 0.94, 0.7), "steel")
box("storage_right", (3.05, 0.47, 1.42), (0.03, 0.94, 0.7), "steel")
box("storage_back", (2.72, 0.47, 1.76), (0.69, 0.94, 0.025), "steel")
box("storage_top", (2.72, 0.935, 1.42), (0.69, 0.02, 0.7), "steel")
for height in [0.2, 0.49]:
    box("drawer_front", (2.72, height, 1.04), (0.65, 0.27, 0.025), "trim")
    box("drawer_handle", (2.72, height + 0.06, 1.00), (0.17, 0.018, 0.04), "steel")
box("city_base", (2.67, 1.3885, -1.3), (0.48, 0.035, 0.32), "cream")
for row in range(4):
    for column in range(5):
        if (row, column) in [(1, 2), (2, 2), (0, 4)]:
            continue
        height = 0.027 + ((row * 3 + column * 7) % 5) * 0.019
        box("city_building", (2.49 + column * 0.086, 1.4065 + height / 2, -1.42 + row * 0.076), (0.056, height, 0.052), "cream", 0.002)
box("dock", (2.87, 1.411, -1.22), (0.06, 0.008, 0.05), "steel", 0.001)
for column in range(4):
    box("street", (2.532 + column * 0.086, 1.4065, -1.30), (0.009, 0.001, 0.28), "trim", 0)
box("prototype_base", (2.63, 0.7285, -1.25), (0.37, 0.027, 0.22), "steel")
for offset in range(4):
    box("timeline_layer", (2.51 + offset * 0.069, 0.7485 + offset * 0.009, -1.25), (0.035, 0.013, 0.19), "cream", 0.002)
    if offset:
        box("timeline_spacer", (2.51 + offset * 0.069, 0.742 + offset * 0.009 / 2, -1.25), (0.024, offset * 0.009, 0.10), "steel", 0.001)
for material in materials.values():
    bpy.ops.object.select_all(action="DESELECT")
    matching = [item for item in bpy.context.scene.objects if item.type == "MESH" and item.data.materials[0] == material]
    for item in matching:
        item.select_set(True)
    if matching:
        bpy.context.view_layer.objects.active = matching[0]
        bpy.ops.object.join()
        bpy.context.object.name = "room_" + material.name
destination = os.path.join(ROOT, "public/room/models/room-shell.glb")
os.makedirs(os.path.dirname(destination), exist_ok=True)
staged = destination.replace(".glb", ".stage.glb")
bpy.ops.export_scene.gltf(filepath=staged, export_format="GLB", export_cameras=False, export_lights=False)
os.replace(staged, destination)
print("ROOM_SHELL_BYTES", os.path.getsize(destination))
