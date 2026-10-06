"""Blender 4.5 LTS. Reproducible three-object asset, never the entire entrance.
Run: blender -b --factory-startup --python scripts/blender/build-entrance-break.py
Add -- --preview to render the neutral desktop asset via CPU Cycles.
Coordinates: authored screen pixels -> Blender (right, -depth, up) -> glTF (X,Y,Z).
"""
import bpy, json, math, pathlib, subprocess, sys, gzip
from mathutils import Vector

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/entrance/models'
OUT.mkdir(parents=True, exist_ok=True)
DATA = json.loads(subprocess.check_output(['node', str(ROOT/'scripts/blender/export-assembly.mjs')], cwd=ROOT))


def material(name, color, roughness, metal=0):
    mat=bpy.data.materials.new(name); mat.use_nodes=True
    shader=mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=(*color,1)
    shader.inputs['Roughness'].default_value=roughness
    shader.inputs['Metallic'].default_value=metal
    return mat


def build_surface(name, piece, composition, pivot, face, edge, bevel):
    w,h=composition['width'],composition['height']
    points=piece['points']; count=len(points)
    px,py=(pivot[0]-w/2)/100,(h/2-pivot[1])/100
    vertices=[]
    for front in [False,True]:
        for index,(x,y) in enumerate(points):
            depth=piece['depth']/100 if front else 0
            sx=(x-w/2)/100-depth*.24
            sy=(h/2-y)/100+depth*.35
            z=piece['z']/100+depth
            # A genuinely folded bracket: free edge rises off its mounting face.
            if name=='MetalBracket': z+=max(0,(x-pivot[0])/100)*.28
            vertices.append((sx-px,-z,sy-py))
    faces=[tuple(range(count-1,-1,-1)),tuple(range(count,count*2))]
    faces += [(i,(i+1)%count,(i+1)%count+count,i+count) for i in range(count)]
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(vertices,[],faces); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj)
    obj.location=(px,0,py)
    obj.data.materials.append(face)
    if face!=edge: obj.data.materials.append(edge)
    for poly in mesh.polygons: poly.material_index=0 if poly.index==1 or face==edge else 1
    # Face UV uses the exact common print plane, not individual-object bounds.
    uv=mesh.uv_layers.new(name='RegisteredPrint')
    for poly in mesh.polygons:
        for loop in poly.loop_indices:
            v=mesh.vertices[mesh.loops[loop].vertex_index].co
            uv.data[loop].uv=((v.x+px)*100/w+.5,(v.z+py)*100/h+.5)
    bpy.context.view_layer.objects.active=obj; obj.select_set(True)
    # Consistent outward normals before bevel. Keep outer plate smooth and dense.
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    modifier=obj.modifiers.new('Small construction bevel','BEVEL')
    modifier.width=bevel; modifier.segments=3 if name!='RubberJoint' else 4
    modifier.limit_method='ANGLE'; modifier.angle_limit=.18; modifier.affect='EDGES'; modifier.harden_normals=True
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    for poly in obj.data.polygons: poly.use_smooth=True
    weighted=obj.modifiers.new('Weighted face normals','WEIGHTED_NORMAL'); weighted.keep_sharp=True; weighted.weight=50
    bpy.ops.object.modifier_apply(modifier=weighted.name)
    obj.select_set(False)
    return obj


reports=[]
for item in DATA:
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    for mat in list(bpy.data.materials): bpy.data.materials.remove(mat)
    comp,assembly=item['composition'],item['assembly']
    face=material('PrintFace',(.93,.92,.89),.38)
    edge=material('EnamelCore',(.66,.66,.61),.83)
    metal=material('BrushedMetal',(.50,.52,.48),.40,.78)
    rubber=material('CharcoalRubber',(.024,.025,.021),.96)
    objects=[build_surface('BreakFragment',assembly['fragment'],comp,assembly['pivot'],face,edge,.008)]
    for node,piece_id,mat,width in [('MetalBracket','metal-lip',metal,.007),('RubberJoint','rubber-join',rubber,.026)]:
        piece=next(p for p in comp['pieces'] if p['id']==piece_id)
        objects.append(build_surface(node,piece,comp,assembly['focus'],mat,mat,width))
    for obj in objects: obj.select_set(True)
    filename='entrance-break-'+('mobile' if item['mobile'] else 'desktop')+'.glb'
    target=OUT/filename
    bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_animations=False,export_cameras=False,export_lights=False)
    for obj in objects: obj.data.calc_loop_triangles()
    triangles=sum(len(obj.data.loop_triangles) for obj in objects)
    reports.append({'file':filename,'objects':[o.name for o in objects],'triangles':triangles,'bytes':target.stat().st_size,'gzip_bytes':len(gzip.compress(target.read_bytes(),mtime=0))})
    if not item['mobile'] and '--preview' in sys.argv:
        scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.device='CPU'; scene.cycles.samples=32
        scene.world.color=(.22,.22,.22)
        # Frame only the signature junction in a neutral product-lighting preview.
        center=Vector((sum(o.location.x for o in objects)/3,-.2,sum(o.location.z for o in objects)/3))
        bpy.ops.object.camera_add(location=center+Vector((.4,-7,2.5)))
        camera=bpy.context.object; camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler(); camera.data.type='ORTHO'; camera.data.ortho_scale=4.4; scene.camera=camera
        for offset,power,size in [((-3,-4,5),500,4),((4,-2,1),100,3)]:
            bpy.ops.object.light_add(type='AREA',location=center+Vector(offset)); light=bpy.context.object; light.data.energy=power; light.data.shape='DISK'; light.data.size=size; light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
        scene.render.resolution_x=720; scene.render.resolution_y=720; scene.render.resolution_percentage=100
        scene.render.filepath=str(ROOT/'visual-qa/entrance-stage-c5/blender-neutral.png'); pathlib.Path(scene.render.filepath).parent.mkdir(parents=True,exist_ok=True)
        bpy.ops.render.render(write_still=True)
report={'blender':bpy.app.version_string,'source':'scripts/blender/build-entrance-break.py','export':'GLB, glTF Y-up, applied bevel/weighted normals, UVs, no textures/animation/decoder','assets':reports}
(OUT/'geometry-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
