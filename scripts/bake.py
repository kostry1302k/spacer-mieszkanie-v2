# Wypalanie światła (lightmapy) w Blenderze, Cycles na GPU (Metal).
# Uruchamiane z katalogu projektu:
#   /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P scripts/bake.py -- \
#     --scene bake-work/styl1.glb --lights bake-work/styl1-day.json --out public/bake/m21/styl1-day [--size 4096 --samples 256]
# Wynik: <out>.glb (geometria z drugim UV), <out>.png (lightmapa RGBM, 8 bit RGBA), <out>.json ({ scale, ... }).
import argparse
import json
import math
import os
import sys
import time

import bpy
import numpy as np

args = argparse.ArgumentParser()
args.add_argument('--scene', required=True)
args.add_argument('--lights', required=True)
args.add_argument('--out', required=True)
args.add_argument('--size', type=int, default=4096)
args.add_argument('--samples', type=int, default=256)
args.add_argument('--preview', action='store_true', help='zamiast wypalania: render widoku z kamery (<out>-preview.png)')
args.add_argument('--camera', default='1.6,1.65,1.6,0', help='x,y,z (m, three.js), kierunek patrzenia w stopniach (0 = +z)')
args.add_argument('--exposure', type=float, default=4.5, help='ekspozycja wnętrza w EV (jak w aparacie): podgląd i jasność lightmapy w spacerze')
a = args.parse_args(sys.argv[sys.argv.index('--') + 1:])

t0 = time.time()
stamp = lambda label: print(f'[bake] {label}: {time.time() - t0:.0f} s', flush=True)
os.makedirs(os.path.dirname(a.out), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a.scene)
lights = json.load(open(a.lights))
scene = bpy.context.scene
stamp('import')

# ── Render: Cycles na GPU ──
scene.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'METAL'
prefs.get_devices()
for d in prefs.devices:
    d.use = d.type == 'METAL'
scene.cycles.device = 'GPU'
scene.cycles.samples = a.samples
scene.cycles.max_bounces = 6
scene.cycles.diffuse_bounces = 4
scene.cycles.sample_clamp_indirect = 10  # bez „świetlików” od słońca odbitego od podłogi
scene.cycles.caustics_reflective = scene.cycles.caustics_refractive = False

# ── Niebo: to samo HDRI i ten sam obrót (π wokół pionu) co w spacerze – słońce od strony balkonu ──
world = bpy.data.worlds.new('sky')
scene.world = world
world.use_nodes = True
nodes, links = world.node_tree.nodes, world.node_tree.links
nodes.clear()
env = nodes.new('ShaderNodeTexEnvironment')
env.image = bpy.data.images.load(os.path.abspath(lights['hdri']))
bg = nodes.new('ShaderNodeBackground')
bg.inputs['Strength'].default_value = lights['hdriStrength']
out = nodes.new('ShaderNodeOutputWorld')
coord = nodes.new('ShaderNodeTexCoord')
mapping = nodes.new('ShaderNodeMapping')
mapping.inputs['Rotation'].default_value[2] = math.pi  # three.js: scene.environmentRotation.y = π
links.new(coord.outputs['Generated'], mapping.inputs['Vector'])
links.new(mapping.outputs['Vector'], env.inputs['Vector'])
neutral = nodes.new('ShaderNodeHueSaturation')  # HDRI z trawą barwiło wnętrze na zielono – niebo przygaszone do neutralnego
neutral.inputs['Saturation'].default_value = 0.35
links.new(env.outputs['Color'], neutral.inputs['Color'])
links.new(neutral.outputs['Color'], bg.inputs['Color'])
links.new(bg.outputs['Background'], out.inputs['Surface'])


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


# Trawa pod budynkiem odbija słońce do wnętrza – w wypalaniu neutralna, żeby nie barwić pokoi na zielono.
for mat in bpy.data.materials:
    if mat.name == 'ground' and mat.node_tree:
        for node in mat.node_tree.nodes:
            if node.type == 'BSDF_PRINCIPLED':
                for link in list(node.inputs['Base Color'].links):
                    mat.node_tree.links.remove(link)
                node.inputs['Base Color'].default_value = (0.22, 0.21, 0.19, 1)

# ── Słońce: ten sam kierunek co w spacerze (three.js → Blender: x, -z, y) ──
if lights.get('sun'):
    sx, sy, sz = lights['sun']['direction']
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', type='SUN'))
    sun.data.energy = lights['sun']['strength']
    sun.data.angle = math.radians(1.5)  # miękka krawędź cienia
    sun.data.color = (1.0, 0.94, 0.86)
    sun.rotation_mode = 'QUATERNION'
    sun.rotation_quaternion = __import__('mathutils').Vector((sx, -sz, sy)).to_track_quat('Z', 'Y')
    scene.collection.objects.link(sun)

# ── Lampy: punktowe; three.js (cd, y w górę) → Blender (W, z w górę) ──
for i, lamp in enumerate(lights['lamps']):
    data = bpy.data.lights.new(f'lamp{i}', type='POINT')
    data.energy = 4 * math.pi * lamp['candela'] * 2 ** -a.exposure  # lampy wyglądają jak w spacerze mimo rozjaśnienia wnętrza
    data.shadow_soft_size = 0.04
    hexc = lamp['color']
    data.color = tuple(srgb_to_linear(((hexc >> s) & 255) / 255) for s in (16, 8, 0))
    obj = bpy.data.objects.new(f'lamp{i}', data)
    x, y, z = lamp['position']
    obj.location = (x, -z, y)
    scene.collection.objects.link(obj)

if a.preview:
    x, y, z, yaw = (float(v) for v in a.camera.split(','))
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    cam.data.lens = 18
    cam.location = (x, -z, y)
    cam.rotation_euler = (math.radians(90), 0, math.radians(180 + yaw))
    scene.collection.objects.link(cam)
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = 800, 600
    scene.view_settings.view_transform = 'AgX'
    scene.view_settings.exposure = a.exposure
    scene.render.filepath = os.path.abspath(a.out + '-preview.png')
    bpy.ops.render.render(write_still=True)
    stamp('podgląd')
    sys.exit(0)

# ── Jedna bryła do wypalenia (otoczenie `env:*` zostaje osobno – tylko zasłania niebo) ──
targets = [o for o in scene.objects if o.type == 'MESH' and not o.name.startswith('env:')]
bpy.ops.object.select_all(action='DESELECT')
for o in targets:
    o.select_set(True)
bpy.context.view_layer.objects.active = targets[0]
bpy.ops.object.make_single_user(object=True, obdata=True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.join()
baked = bpy.context.view_layer.objects.active
baked.name = 'baked'
stamp(f'scalanie: {len(baked.data.polygons)} ścian')

# ── Drugie UV pod lightmapę: wspólne wierzchołki, wyspy wg kąta, ciasne upakowanie ──
lightmap_uv = baked.data.uv_layers.new(name='lightmap')
baked.data.uv_layers.active = lightmap_uv
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=0.0005)
# correct_aspect=False: inaczej Blender bierze proporcje z dowolnej tekstury (płytki 8:1) i ściska wyspy 8× (smugi na ścianach).
bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0, correct_aspect=False, scale_to_bounds=False)
bpy.ops.uv.pack_islands(rotate=True, margin=0.002)
bpy.ops.object.mode_set(mode='OBJECT')
stamp('UV')

# ── Obrazy docelowe: światło + pomocnicze (kolor i normalne) dla odszumiania ──
def target(name):
    return bpy.data.images.new(name, a.size, a.size, float_buffer=True, alpha=False)


img, albedo, normal = target('lightmap'), target('albedo'), target('normal')
albedo.pixels.foreach_set(np.ones(a.size * a.size * 4, dtype=np.float32))  # mapa to samo światło (biała powierzchnia) – taki „kolor” dla odszumiania
bake_nodes = []
for slot in baked.material_slots:
    mat = slot.material
    mat.use_nodes = True
    node = mat.node_tree.nodes.new('ShaderNodeTexImage')
    mat.node_tree.nodes.active = node
    bake_nodes.append(node)

bpy.ops.object.select_all(action='DESELECT')
baked.select_set(True)
bpy.context.view_layer.objects.active = baked


def bake_into(image, bake_type, passes, samples):
    for node in bake_nodes:
        node.image = image
    scene.cycles.samples = samples
    scene.render.bake.margin_type = 'ADJACENT_FACES'  # dopełnienie krawędzi wysp światłem sąsiednich ścian, nie rozmazaniem
    bpy.ops.object.bake(type=bake_type, pass_filter=passes, margin=16, use_clear=True)


# Samo światło rozproszone (bezpośrednie + odbite), bez koloru powierzchni – kolor dokłada materiał w spacerze.
bake_into(img, 'DIFFUSE', {'DIRECT', 'INDIRECT'}, a.samples)
stamp('wypalanie')
bake_into(normal, 'NORMAL', set(), 4)
stamp('przebiegi pomocnicze')


def read(image):
    data = np.empty(a.size * a.size * 4, dtype=np.float32)
    image.pixels.foreach_get(data)
    return data


pixels = read(img)
nor = read(normal)
nor[np.arange(nor.size) % 4 != 3] = nor[np.arange(nor.size) % 4 != 3] * 2 - 1  # 0..1 → -1..1 (tak czyta OIDN)
normal.pixels.foreach_set(nor)

# ── Odszumianie OIDN z kolorem i normalnymi: krawędzie i faktura zostają, szum znika (bez tego – plamy) ──
try:
    den = bpy.data.scenes.new('denoise')
    tree = bpy.data.node_groups.new('denoise', 'CompositorNodeTree')
    den.compositing_node_group = tree
    tree.interface.new_socket(name='Image', in_out='OUTPUT', socket_type='NodeSocketColor')
    n_den = tree.nodes.new('CompositorNodeDenoise')
    for socket, image in (('Image', img), ('Albedo', albedo), ('Normal', normal)):
        n = tree.nodes.new('CompositorNodeImage')
        n.image = image
        tree.links.new(n.outputs['Image'], n_den.inputs[socket])
    n_out = tree.nodes.new('NodeGroupOutput')
    tree.links.new(n_den.outputs['Image'], n_out.inputs['Image'])
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    den.collection.objects.link(cam)
    den.camera = cam
    den.render.engine = 'BLENDER_WORKBENCH'
    den.render.resolution_x = den.render.resolution_y = a.size
    den.render.resolution_percentage = 100
    den.render.use_compositing = True
    den.view_settings.view_transform = 'Standard'
    den.render.image_settings.file_format = 'OPEN_EXR'
    den.render.image_settings.color_depth = '32'
    exr = os.path.abspath(a.out + '-denoised.exr')
    den.render.filepath = exr
    bpy.ops.render.render(write_still=True, scene=den.name)
    result = bpy.data.images.load(exr)
    result.pixels.foreach_get(pixels)
    os.remove(exr)
    stamp('odszumianie')
except Exception as e:  # bez odszumiania lightmapa jest tylko bardziej ziarnista
    print(f'[bake] odszumianie pominięte: {e}', flush=True)

# ── Zapis RGBM (8 bit RGBA): światło = rgb × a × scale. Słońce na podłodze bywa setki razy jaśniejsze
#    niż kąt pokoju – mnożnik w kanale alfa zachowuje szczegóły w obu (zwykłe 8 bit zerowałoby cienie). ──
rgb = pixels.reshape(-1, 4)[:, :3]
scale = float(np.percentile(rgb.max(axis=1), 99.9)) or 1.0
mult = np.ceil(np.clip(rgb.max(axis=1, keepdims=True) / scale, 1 / 255, 1) * 255) / 255
enc = np.clip(rgb / (mult * scale), 0, 1)
out_img = bpy.data.images.new('lightmap_rgbm', a.size, a.size, alpha=True)
out_img.colorspace_settings.name = 'Non-Color'  # dane, nie kolor – zapis bez konwersji
out_img.alpha_mode = 'STRAIGHT'
out_img.pixels.foreach_set(np.concatenate([enc, mult], axis=1).astype(np.float32).ravel())
out_img.filepath_raw = os.path.abspath(a.out + '.png')
out_img.file_format = 'PNG'
out_img.save()

bpy.ops.object.select_all(action='DESELECT')
baked.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=os.path.abspath(a.out + '.glb'),
    export_format='GLB',
    use_selection=True,
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_image_format='NONE',
    export_yup=True,
)
lit = rgb.mean(axis=1)
ambient = float(np.median(lit[lit > 1e-4])) if (lit > 1e-4).any() else 0.0  # typowe światło we wnętrzu – dla brył ruchomych
json.dump({'scale': scale, 'ambient': ambient, 'exposure': a.exposure, 'size': a.size, 'samples': a.samples, 'seconds': round(time.time() - t0)}, open(a.out + '.json', 'w'))
# Spis dostępnych lightmap w folderze (spacer wczytuje tylko te, które tu są).
folder = os.path.dirname(os.path.abspath(a.out))
names = sorted(f[:-5] for f in os.listdir(folder) if f.endswith('.json') and f != 'index.json')
json.dump(names, open(os.path.join(folder, 'index.json'), 'w'))
stamp('gotowe')
