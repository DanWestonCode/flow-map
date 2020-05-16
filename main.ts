/// <reference path="../pixi/pixi-typescript/pixi.js.d.ts" />

namespace Flow {
    // base class for scene objects
    interface SceneObject {
        init (loader: PIXI.loaders.Loader, resources: any, app : PIXI.Application) : void;
        update (time : number) : void;
    }

    export class Main {
        private app: PIXI.Application;
        private water : WaterSurface;        

        constructor() {
            this.app = new PIXI.Application(400, 400);            

            var div = document.getElementById('stage-flow');
            div.appendChild(this.app.view);  
            
            // load assets
            PIXI.loader
            .add("water", "../flow/graphics/water.png")
            .add("noise", "../flow/graphics/noise.png")
            .add("bump", "../flow/graphics/bump.png")
            .add("flowMap", "../flow/graphics/flowmap.png")
            .add("shader", "../flow/shaders/shader.frag")
            .load((loader: PIXI.loaders.Loader, resources: any)=>{this.onLoad(loader, resources)});
        }

        private onLoad (loader: PIXI.loaders.Loader, resources: any) : void {
            // create new water GO 
            this.water = new WaterSurface ()
            this.water.init (loader, resources, this.app);
            // add water to update
            this.app.ticker.add (delta => this.water.update (delta));
        }
    }

    export class FlowFilter extends PIXI.Filter <any> {        
        constructor (frag : string, flowMap : PIXI.Texture, water : PIXI.Texture, bump : PIXI.Texture, noise : PIXI.Texture) {
            super (null, frag, {
                time : {
                    type: 'f',
                    value: 0
                },
                uFlow : {
                    type: 'sampler2D',
                    value: flowMap
                },
                uWater : {
                    type: 'sampler2D',
                    value: water
                },
                uBump : {
                    type: 'sampler2D',
                    value: bump
                },
                uNoise : {
                    type: 'sampler2D',
                    value: noise
                }
            });
        }        
    }

    export class WaterSurface implements SceneObject {
        private filter : FlowFilter;

        public init (loader: PIXI.loaders.Loader, resources: any, app : PIXI.Application) : void {

            let water =  new PIXI.Sprite (resources.water.texture);
            let flowMap = new PIXI.Sprite (resources.flowMap.texture);  
            let bump = new PIXI.Sprite (resources.bump.texture);
            let noise = new PIXI.Sprite (resources.noise.texture);

            this.filter = new FlowFilter (resources.shader.data, flowMap.texture, water.texture, bump.texture, noise.texture);
                
            water.filters = [this.filter];
                
            app.stage.addChild (water);
        }

        public update (time : number) : void {
            this.filter.uniforms.time += 0.1 * time;
        }

    }
    
    new Flow.Main ();
}