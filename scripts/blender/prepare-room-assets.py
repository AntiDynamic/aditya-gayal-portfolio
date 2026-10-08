import bpy
import json
import os
import struct
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MANIFEST = os.path.join(ROOT, "public/room/asset-manifest.json")
with open(MANIFEST) as source:
    assets = json.load(source)
output = os.path.join(ROOT, "public/room/models")
os.makedirs(output, exist_ok=True)
for asset in assets:
    asset["optimizedResolution"] = 768 if asset["identifier"] in ["wooden_bookshelf_worn", "metal_office_desk"] else 512
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=asset["rawPath"])
    meshes = [item for item in bpy.context.scene.objects if item.type == "MESH"]
    coordinates = [item.matrix_world @ Vector(corner) for item in meshes for corner in item.bound_box]
    low = Vector([min(corner[axis] for corner in coordinates) for axis in range(3)])
    high = Vector([max(corner[axis] for corner in coordinates) for axis in range(3)])
    asset["dimensions"] = list(high - low)
    for image in bpy.data.images:
        if image.size[0] > asset["optimizedResolution"]:
            ratio = asset["optimizedResolution"] / image.size[0]
            image.scale(asset["optimizedResolution"], max(1, round(image.size[1] * ratio)))
        image.pack()
    for item in meshes:
        bpy.context.view_layer.objects.active = item
        item.select_set(True)
        if len(item.data.polygons) > 3500 or asset["identifier"] == "book_encyclopedia_set_01" and len(item.data.polygons) > 100:
            modifier = item.modifiers.new("web_budget", "DECIMATE")
            modifier.ratio = 0.06 if asset["identifier"] == "book_encyclopedia_set_01" else 0.30 if asset["identifier"] == "binder_notebook" else 0.45
            bpy.ops.object.modifier_apply(modifier=modifier.name)
        item.select_set(False)
    bpy.ops.object.select_all(action="DESELECT")
    for item in meshes:
        transform = item.matrix_world.copy()
        item.parent = None
        item.matrix_world = transform
        item.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    meshes = [item for item in bpy.context.scene.objects if item.type == "MESH"]
    for item in list(bpy.context.scene.objects):
        if item.type != "MESH":
            bpy.data.objects.remove(item, do_unlink=True)
    parent = bpy.data.objects.new(asset["identifier"], None)
    bpy.context.collection.objects.link(parent)
    for item in list(bpy.context.scene.objects):
        if item != parent and item.parent is None:
            item.parent = parent
    parent.location = (-(low.x + high.x) / 2, -(low.y + high.y) / 2, -low.z)
    destination = os.path.join(output, asset["identifier"] + ".glb")
    staged = destination.replace(".glb", ".stage.glb")
    bpy.ops.export_scene.gltf(filepath=staged, export_format="GLB", export_image_format="JPEG", export_jpeg_quality=80, export_cameras=False, export_lights=False, export_animations=False)
    os.replace(staged, destination)
    asset["optimizedBytes"] = os.path.getsize(destination)
    with open(destination, "rb") as exported:
        exported.read(12)
        length, kind = struct.unpack("<II", exported.read(8))
        document = json.loads(exported.read(length))
    asset["optimizedPrimitiveCount"] = sum(len(mesh["primitives"]) for mesh in document["meshes"])
    asset["triangles"] = sum(sum(len(polygon.vertices) - 2 for polygon in item.data.polygons) for item in meshes)
    print(asset["identifier"], asset["dimensions"], asset["optimizedBytes"], asset["triangles"])
with open(MANIFEST, "w") as destination:
    json.dump(assets, destination, indent=2)
