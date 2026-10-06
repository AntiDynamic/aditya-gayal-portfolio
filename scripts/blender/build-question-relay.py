"""Original sculptural ribbons. Blender authors geometry; R3F owns the journey.
blender -b --factory-startup --python scripts/blender/build-question-relay.py
No external assets, textures, simulations, or proprietary Lusion geometry.
"""
import bpy, math, pathlib, json, gzip
from mathutils import Vector

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/models'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, roughness, metal=0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metal
    return m

materials = [material('Warm enamel', (.89,.84,.73), .33, .08),
             material('Vermilion enamel', (.68,.015,.006), .34, .12),
             material('Satin aluminum', (.53,.57,.63), .38, .72)]
objects = []
for index in range(3):
    vertices, faces = [], []
    count = 104
    radius = [2.35, 1.85, 2.05][index]
    width = [.64, .55, .26][index]
    thickness = [.15, .13, .07][index]
    start = index * 1.85 + .2
    sweep = [4.9, 4.6, 5.1][index]
    for step in range(count+1):
        u = step / count
        a = start + sweep*u
        r = radius + .18*math.sin(u*math.pi*2)
        center = Vector((r*math.cos(a), r*math.sin(a), .62*math.sin(a*1.4+index)))
        radial = Vector((math.cos(a), math.sin(a), 0))
        # A broad, gently twisted face rather than a torus/circular tube.
        twist = .48*math.sin(a+index) + .12
        wide = radial*math.cos(twist) + Vector((0,0,math.sin(twist)))
        normal = radial*(-math.sin(twist)) + Vector((0,0,math.cos(twist)))
        for sw, st in [(-1,-1),(1,-1),(1,1),(-1,1)]:
            vertices.append(center + wide*width*.5*sw + normal*thickness*.5*st)
    for step in range(count):
        for side in range(4):
            k=step*4+side; n=step*4+(side+1)%4
            faces.append((k,n,n+4,k+4))
    faces.extend([(3,2,1,0),tuple(range(count*4,count*4+4))])
    mesh = bpy.data.meshes.new('Ribbon topology'); mesh.from_pydata(vertices,[],faces); mesh.update()
    uv = mesh.uv_layers.new(name='Printed ribbon')
    for face in mesh.polygons:
        for loop in face.loop_indices:
            vertex = mesh.loops[loop].vertex_index
            uv.data[loop].uv = (vertex//4/count, 1 if vertex%4 in (1,2) else 0)
    obj = bpy.data.objects.new(['QuestionShell','CounterQuestion','ConnectionRail'][index], mesh)
    bpy.context.collection.objects.link(obj); obj.data.materials.append(materials[index])
    bpy.context.view_layer.objects.active = obj; obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    bevel=obj.modifiers.new('Readable physical edges','BEVEL'); bevel.width=.025 if index<2 else .012; bevel.segments=3; bevel.angle_limit=.35; bevel.limit_method='ANGLE'; bevel.harden_normals=True
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    for face in obj.data.polygons: face.use_smooth=True
    weighted=obj.modifiers.new('Weighted studio normals','WEIGHTED_NORMAL'); weighted.keep_sharp=True
    bpy.ops.object.modifier_apply(modifier=weighted.name)
    obj.select_set(False); objects.append(obj)

for obj in objects: obj.select_set(True)
target=OUT/'question-relay.glb'
bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_yup=False,export_apply=True,export_normals=True,export_texcoords=True,export_materials='EXPORT',export_animations=False,export_cameras=False,export_lights=False)
for obj in objects: obj.data.calc_loop_triangles()
report={'generator':'scripts/blender/build-question-relay.py','blender':bpy.app.version_string,'license':'Original project geometry; no third-party assets','meshes':[obj.name for obj in objects],'triangles':sum(len(o.data.loop_triangles) for o in objects),'bytes':target.stat().st_size,'gzip_bytes':len(gzip.compress(target.read_bytes(),mtime=0)),'coordinates':'X right, Y up, Z depth; intentional export_yup=False'}
(OUT/'question-relay.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
