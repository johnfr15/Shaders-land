import * as THREE from 'three'

/**
 * @notice This Class is inspired by the work of Jesse Zhou https://github.com/enderh3art/Ramen-Shop/blob/main/src/Experience/World/Hologram.js
 * Where he himself got inspired by threejs example: https://threejs.org/examples/#webgl_points_dynamic 
 * 
 * px: 'position x' (The current 'x position' of a particule)'
 * py: 'position y' (The current 'y position' of a particule)'
 * pz: 'position z' (The current 'z position' of a particule)'
 *  
 * ix: 'inital x'   (The inital 'x position' of a particule)
 * iy: 'inital y'   (The inital 'y position' of a particule)
 * iz: 'inital z'   (The inital 'z position' of a particule)
 * 
 * dx: 'distance x' (The current distance between 'px' and 'ix' of a particule)
 * dy: 'distance y' (The current distance between 'py' and 'iy' of a particule)
 * dz: 'distance z' (The current distance between 'pz' and 'iz' of a particule)
 * 
 * 
 */
export default class Hologram
{

    constructor(scene, model, time, gui, sounds)
    {
        this.scene = scene
        this.model = model
        this.gui = gui
        this.time = time
        this.sounds = sounds

        this.update = function update() {}

        this.positions = this.combineBuffer( this.model.scene, 'position' )
        this.createMesh( this.positions, this.scene, 1, 0, 0, 0 )

        this.initGui()
    }

    combineBuffer( model, bufferName ) 
    {
        this.totalCount = 0;
    
        model.traverse( ( child ) => 
        {

            if ( child.isMesh ) 
            {    
                this.buffer = child.geometry.attributes[ bufferName ];
    
                this.totalCount += this.buffer.array.length;
            }
    
        } );
    
        this.combined = new Float32Array( this.totalCount );
    
        this.offset = 0;
    
        model.traverse(( child ) => {

            if ( child.isMesh ) {
    
                this.buffer = child.geometry.attributes[ bufferName ];
    
                this.combined.set( this.buffer.array, this.offset );
                this.offset += this.buffer.array.length;
            }
        } );

        return new THREE.BufferAttribute( this.combined, 3 );
    }

    createMesh( positions, scene, scale, x, y, z ) {

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute( 'position', positions.clone() );
        this.geometry.setAttribute( 'initialPosition', positions.clone() );
    
        this.geometry.attributes.position.setUsage( THREE.DynamicDrawUsage );

        this.mesh = new THREE.Points( this.geometry, new THREE.PointsMaterial( { size: 0.05, color: new THREE.Color( 0x00ffff ) } ) );
        this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale;
    
        this.mesh.position.x = x 
        this.mesh.position.y = y 
        this.mesh.position.z = z 
    
        scene.add( this.mesh );
        
        this.data = {
            mesh: this.mesh, 
            color: 0x00ffff,
            autoRaise: true,
            autoRaiseDelay: 170, 
            verticesDown: 0, 
            verticesUp: 0, 
            direction: 1, 
            speedRiseUp: 0.0006, 
            speedFallDown: 0.001,
            delay: 170
        }

        this.enableUpdate()
        this.enableHologramAction()
    }

    initGui()
    {
        this.data["raiseHologram"] = this.raiseHologram
        this.data["breakHologram"] = this.breakHologram

        this.gui
            .addColor( this.data , 'color')
            .onChange((value) => this.data.mesh.material.color = new THREE.Color(value) )

        this.gui
            .add( this.data , 'autoRaise')
            .onChange((value) => this.data.mesh.autoRaise = value )

        this.gui
            .add( this.data , 'autoRaiseDelay')
            .onChange((value) => this.data.autoRaiseDelay = value )

        this.gui
            .add( this.data , 'direction', -1, 1, 2)
            .onChange((value) => this.data.direction = value )

        this.gui
            .add( this.data , 'speedRiseUp', 0, 0.002, 0.0001)
            .onChange((value) => this.data.speedRiseUp = value )

        this.gui
            .add( this.data , 'speedFallDown', 0, 0.002, 0.0001)
            .onChange((value) => this.data.speedFallDown = value )
        
        this.gui.add( this.data, 'raiseHologram')
        this.gui.add( this.data, 'breakHologram')

    }



    enableHologramAction()
    {
        /**
         * @notice Set up the metadata for the particules to go up
         */
        this.raiseHologram = () =>
        {
            if ( this.data.direction <= 0 )
            {
                if (this.sounds )
                    this.sounds.play('rise')
                this.data.direction = 1; // Rise up next frame
                this.data.verticesDown = 0; // Every particule will rise starting next frame thus no one is fully down anymore
                this.data.delay = this.data.autoRaiseDelay;
            }
        }
        /**
         * @notice Set up the metadata for the particules to go up
         */
        this.autoRaiseHologram = () =>
        {
            if ( this.data.delay <= 0 ) 
                this.raiseHologram()
            else
                this.data.delay -= 1;
        }

        /**
         * @notice Set up the metadata for the particules to go down
         */
        this.breakHologram = () =>
        {
            if ( this.data.direction >= 0)
            {
                if (this.sounds )
                    this.sounds.play('break')
                this.data.direction = -1; // Fall down next frame
                this.data.verticesUp = 0; // Every particule will fall starting next frame thus no one is fully up anymore
            }
        }
    }


    enableUpdate()
    {
        // Update Function for every tick
        this.update = function update() {

            // Mesh drop and Rise
            this.positions = this.data.mesh.geometry.attributes.position;
            this.initialPositions = this.data.mesh.geometry.attributes.initialPosition;

            this.count = this.positions.count;


            for ( let i = 0; i < this.count; i++ ) {

                // Get currrent position of a particule
                this.px = this.positions.getX( i );
                this.py = this.positions.getY( i );
                this.pz = this.positions.getZ( i );



                // falling down
                if ( this.data.direction < 0 ) 
                { 
                    if ( this.py > -1 ) // Particule will fall down until it reach this y axis in your scene
                    { 
                        // Add some cool random effect so the particule don't fall down linearly to -1 y position
                        this.positions.setXYZ(
                            i,
                            this.px + 1.5 * ( 0.50 - Math.random() ) * this.data.speedFallDown * this.time.delta,
                            this.py + 3.0 * ( 0.25 - Math.random() ) * this.data.speedFallDown * this.time.delta,
                            this.pz + 1.5 * ( 0.50 - Math.random() ) * this.data.speedFallDown * this.time.delta
                        );
                    }
                    else
                        this.data.verticesDown += 1; // Particule is officially fully down
                }



                // rising up
                if ( this.data.direction > 0 ) 
                { 
                    // Get inital position of a particule
                    this.ix = this.initialPositions.getX( i );
                    this.iy = this.initialPositions.getY( i );
                    this.iz = this.initialPositions.getZ( i );

                    // Get the distance from current position to initial position of a particule
                    this.dx = Math.abs( this.px - this.ix );
                    this.dy = Math.abs( this.py - this.iy );
                    this.dz = Math.abs( this.pz - this.iz );

                    this.d = this.dx + this.dy + this.dx;

                    if ( this.d >= 0.01 ) // Particule will rise up until its distance to the inital position reach 0.01
                    {
                        // Add some cool random effect so the particule don't rise linearly to its inital position
                        this.positions.setXYZ(
                            i,
                            this.px - ( this.px - this.ix ) / this.dx * this.data.speedRiseUp * this.time.delta * ( 0.85 - Math.random() ),
                            this.py - ( this.py - this.iy ) / this.dy * this.data.speedRiseUp * this.time.delta * ( 1 + Math.random() ),
                            this.pz - ( this.pz - this.iz ) / this.dz * this.data.speedRiseUp * this.time.delta * ( 0.85 - Math.random() )
                        );

                    } 
                    else 
                        this.data.verticesUp += 1; // Particule is officially fully up
                }
            }

            // Auto raise
            // In this condition => (this.data.verticesDown >= this.count) we wait that all vertices are fully down before rising them up
            if ( this.data.autoRaise && this.data.verticesDown ) 
                this.autoRaiseHologram()

            this.positions.needsUpdate = true;
        }
    }
}