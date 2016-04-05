"use strict";

import THREE from 'three';
import ShaderDefault from './ShaderDefault';
import ParticleShader from './ParticleShader';

export default class Main {
    
    constructor(paths) {
        
        console.log('[Main] init...', paths.length);

        const RANGE = 200
          , NUM_ROWS = 30
          , TWO_PI = Math.PI*2
          , TRAIL = 6
          , SEPARATION = .8
          , NUM_PARTICLES = paths.length * TRAIL;
        var width = window.innerWidth
          , height = window.innerHeight
          , lifetime = 0
          , rotoRatio = {x:0,y:0}
          , shaderDefault = new ShaderDefault( '50.0' )
          , shaderParticles = new ParticleShader()
          , renderer = new THREE.WebGLRenderer( { antialias: true } )
          , scene = new THREE.Scene()
          , camera = new THREE.PerspectiveCamera( 40, width / height, 1, 20000 )
          , clock = new THREE.Clock(true)
          , uniforms = { color: { type: 'c', value: new THREE.Color( 0xffffff ) } }
          , particlesMaterial = new THREE.ShaderMaterial( {
                uniforms:       uniforms,
                vertexShader:   shaderParticles.getVertex(),
                fragmentShader: shaderParticles.getFragment(),
                // depthTest: false,
                side: THREE.DoubleSide,
                // alphaTest: 0.15,
                transparent: true,
                blending: THREE.NormalBlending
                // blending: THREE.AdditiveBlending
                 })
          , material = new THREE.ShaderMaterial( {
                uniforms: {},
                vertexShader: shaderDefault.getVertex(),
                fragmentShader: shaderDefault.getFragment(),
                side: THREE.DoubleSide,
                depthTest: true,
                // alphaTest: 0.15,
                transparent: false,
                blending: THREE.AdditiveBlending })
          , geometry = new THREE.BufferGeometry()
          , particleSystem= new THREE.Points( geometry, particlesMaterial )
          , plane = new THREE.PlaneGeometry(RANGE, RANGE, NUM_ROWS, NUM_ROWS)
          , mesh = new THREE.Mesh(plane, material);

        camera.position.z = 2000;
        camera.position.x = 0;
        camera.position.y = 80;

        particleSystem.sortParticles = true;
       
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( width, height );
        document.getElementById('container').appendChild(renderer.domElement);
        
        scene.fog = new THREE.Fog( 0xAACCEE );
        renderer.setClearColor( scene.fog.color, 1 );
    
        let positions = new Float32Array( NUM_PARTICLES * 3 )
          , colors = new Float32Array( NUM_PARTICLES * 3 )
          , sizes = new Float32Array( NUM_PARTICLES )
          , color = new THREE.Color(0xff00ff);
        
        for ( var i = 0, i3 = 0; i < NUM_PARTICLES; i ++, i3 += 3 ) {
            positions[ i3 + 0 ] = positions[ i3 + 1 ] = positions[ i3 + 2 ] = 0;
            // color.setHSL( 1- i / NUM_PARTICLES, 1.0, 1.0 );
            color.setHSL( 0,0,0 );
            colors[ i3 + 0 ] = color.r;
            colors[ i3 + 1 ] = color.g;
            colors[ i3 + 2 ] = color.b;
            sizes[ i ] = 0;
        }

        geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
        geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
        scene.add( particleSystem );


        mesh.receiveShadow = true;
        mesh.rotation.x = -0.5 * Math.PI;
        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;
        scene.add(mesh);

        window.addEventListener( 'mousemove', onMouseMove, false );
        window.addEventListener( 'resize', onWindowResize, false );

        animate();

        function onWindowResize() {
            width = window.innerWidth;
            height = window.innerHeight
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize( width, height );
        }

        function onMouseMove(event) {
            rotoRatio.x = event.pageX / width;
            rotoRatio.y = event.pageY / height;
        }
   
        function animate() {

            requestAnimationFrame( animate );
            
            let delta = clock.getDelta();
            if ( delta > 1 ) delta = 0;
            lifetime += delta;

            let positions = geometry.attributes.position.array
              , colors = geometry.attributes.customColor.array
              , sizes = geometry.attributes.size.array
              , color = new THREE.Color()
              , speed = 40
              , getIndex = (x, y) => { return (NUM_ROWS+1) * y + x; }
              , i1 = 0
              , i3 = 0;

            // for ( var vertice of plane.vertices ) {
            //     vertice.z -= delta * 5;
            //     if ( vertice.z < 0 ) vertice.z = 0;
            // }

            for( var path of paths ) {
                for ( var i=0; i<TRAIL; i++, i1++, i3+=3 ) {

                    var precise = ( lifetime * speed + i*SEPARATION ) % path.length
                      , index = Math.floor( precise )
                      , indexNext = index > path.length-2 ? index : index+1
                      , ratio = precise - index;

                    positions[i3] = ( (1-path[index][0])*(ratio) + (1-path[indexNext][0])*(1-ratio) ) * RANGE - RANGE/2; 
                    positions[i3 + 1] = path[index][2] * 90;
                    positions[i3 + 2] = ( (path[index][1])*(ratio) + (path[indexNext][1])*(1-ratio) ) * RANGE - RANGE/2;

                    color.setHSL(path[index][3]*.2+.6, .8, .5);
                    colors[ i3 + 0 ] = color.r;
                    colors[ i3 + 1 ] = color.g;
                    colors[ i3 + 2 ] = color.b;
                    sizes[ i1 ] = 3+6*i/TRAIL;

                    let p = getIndex( Math.floor((1-path[index][0])*(NUM_ROWS+1)), Math.floor(path[index][1]*(NUM_ROWS+1)) );
                    
                    let a = path[index][2] * 90 - 3;
                    plane.vertices[p].z = a;
                } 
            }

            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.customColor.needsUpdate = true;
            geometry.attributes.size.needsUpdate = true;
            plane.verticesNeedUpdate = true;

            scene.rotation.y = ( scene.rotation.y + delta * .999 * ( .65+(-.5+rotoRatio.x)*TWO_PI - scene.rotation.y ) ) % (TWO_PI) ;
            camera.position.z = camera.position.z + delta * .999 * ( (100+250*rotoRatio.y) - camera.position.z);
            camera.position.y = camera.position.y + delta * .999 * ( (200-70*rotoRatio.y) - camera.position.y);
            camera.lookAt(scene.position);

            renderer.render( scene, camera );

        }
    }
}
