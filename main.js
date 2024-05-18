import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import {} from 'suncalc3';

// oh god no
const suncalc = window.SunCalc

function setup () {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
  document.body.appendChild( renderer.domElement );
  
  function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }
  window.addEventListener('resize', onWindowResize, false );
  
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.update();
  
  return { renderer, controls, scene, camera }
}


const { renderer, controls, scene, camera } = setup()

const config = {
  sail: {
    wall_height: 2.6,
    wall_x_left: 0.75,
    wall_x_right: 6.5,
    rail_height: 1.6,
    rail_x_left: 0.75,
    rail_x_right: 4.5
  },
  terrace: {
    width: 4.66,
    depth: 2.58
  },
  gravel: {
    x_right: 7.98,
    x_left: 6
  },
  wall: {
    height: 3.33
  },
  building: {
    height: 5,
    depth: 5,
  },
  floor: {
    width: 3.84,
    depth: 2.25,
    x_gap_left: 0.36
  },
  date: '2024-05-16',
  // Berlin
  location: {
    latitude: 52.520008,
    longitude: 13.404954,
  },
  // Orientation of coordinate system
  x_azimuth: 302 / 180 * Math.PI
}
camera.position.set(0, 5, 8)

{
  // building below
  const dims = [config.gravel.x_left+config.terrace.width+config.gravel.x_right, config.building.height, config.building.depth+config.terrace.depth]
  const box = new THREE.BoxGeometry(...dims, 64, 64, 64);
  const material = new THREE.MeshPhongMaterial( {color: 'lightgray'} ); 
  const mesh = new THREE.Mesh(box, material);
  mesh.position.set(dims[0]/2-config.gravel.x_left, -dims[1]/2, -dims[2]/2+config.terrace.depth);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}
{
  // building top
  const dims = [config.gravel.x_left+config.terrace.width+config.gravel.x_right, config.wall.height, config.building.depth]
  const box = new THREE.BoxGeometry(...dims, 64, 64, 64);
  const material = new THREE.MeshPhongMaterial( {color: 'lightgray'} ); 
  const mesh = new THREE.Mesh(box, material);
  mesh.position.set(dims[0]/2-config.gravel.x_left, dims[1]/2, -dims[2]/2);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}
{
  // terrace
  const dims = [config.terrace.width, 0.05, config.terrace.depth]
  const box = new THREE.BoxGeometry(...dims, 64, 64, 64);
  const material = new THREE.MeshPhongMaterial( {color: 0xfafafa } ); 
  const mesh = new THREE.Mesh(box, material);
  mesh.position.set(dims[0]/2, dims[1]/2, dims[2]/2);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
}
{
  // sail
  const depth = 0.01
  const vertices = [
    [config.sail.wall_x_left, config.sail.wall_height, 0],
    [config.sail.wall_x_right, config.sail.wall_height, 0],
    [config.sail.rail_x_left, config.sail.rail_height, config.terrace.depth],
    [config.sail.rail_x_right, config.sail.rail_height, config.terrace.depth],
    [config.sail.wall_x_left, config.sail.wall_height-depth, 0],
    [config.sail.wall_x_right, config.sail.wall_height-depth, 0],
    [config.sail.rail_x_left, config.sail.rail_height-depth, config.terrace.depth],
    [config.sail.rail_x_right, config.sail.rail_height-depth, config.terrace.depth],
  ].map(p => new THREE.Vector3(...p))
  const geometry = new ConvexGeometry( vertices );
  const material = new THREE.MeshPhongMaterial( {color: 'red' } ); 
  const mesh = new THREE.Mesh( geometry, material );
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add( mesh );
}

const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );

const sun = new THREE.DirectionalLight('white', 1);
sun.castShadow = true;
sun.shadow.mapSize.width = 8096;
sun.shadow.mapSize.height = 8096;
sun.shadow.camera.left = -50
sun.shadow.camera.right = 50
sun.shadow.camera.bottom = -50
sun.shadow.camera.top = 50
scene.add( sun );

function setSunPosition(date) {
  const { azimuth, zenith } = suncalc.getPosition(date, config.location.latitude, config.location.longitude)
  console.log(azimuth/Math.PI*180)
  console.log(zenith)
  sun.position.set(
    10*Math.sin(-azimuth+config.x_azimuth) * Math.sin(zenith),
    10*Math.cos(zenith),
    10*Math.cos(-azimuth+config.x_azimuth) * Math.sin(zenith),
  )
  //renderer.shadowMap.needsUpdate = true;
  console.log(sun.position)
}
// setSunPosition(new Date())
setSunPosition(new Date('2024-05-18T12:30:00Z'))


function animate() {
	requestAnimationFrame( animate );
  controls.update();
	renderer.render( scene, camera );
}
animate();

