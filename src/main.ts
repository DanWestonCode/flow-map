import * as PIXI from "pixi.js"

namespace Flow {
    // base class for scene objects
    interface SceneObject {
        init (loader: PIXI.Loader, resources: any, app : PIXI.Application) : void;
        update (time : number) : void;
    }

    export class Main {
        private app: PIXI.Application;
        private water! : WaterSurface;        

        constructor() {
            // this.app = new PIXI.Application();
            this.app = new PIXI.Application({width: 512, height: 512});

            //Add the canvas that Pixi automatically created for you to the HTML document
            document.body.appendChild(this.app.view);

            // var div = document.getElementById('stage-flow');
            // if (null === div)
            // {
            //     return;
            // }

            //div.appendChild(this.app.view);  
            
            // load assets
            const loader = PIXI.Loader.shared;
            loader
            .add("water", "./graphics/water.png")
            .add("noise", "./graphics/noise.png")
            .add("bump", "./graphics/bump.png")
            .add("flowmap", "./graphics/flowmap.png")
            .add("shader", "./shaders/shader.frag")
            .load((loader, resources: any)=>{this.onLoad(loader, resources)});
        }

        private onLoad (loader: PIXI.Loader, resources: any) : void {
            // let sprite = new PIXI.Sprite();
            // sprite.texture = PIXI.utils.TextureCache["flowmap"];
            // this.app.stage.addChild(sprite);
            // create new water GO 
            this.water = new WaterSurface ()
            this.water.init (loader, resources, this.app);
            // add water to update
            this.app.ticker.add (delta => this.water.update (delta));
        }
    }

    export class FlowFilter extends PIXI.Filter {        
        constructor (frag : string, flowMap : PIXI.Texture, water : PIXI.Texture, bump : PIXI.Texture, noise : PIXI.Texture) {
            super (undefined, frag);

            this.uniforms.uFlow = flowMap;
            this.uniforms.uWater = water;
            this.uniforms.uBump = bump;
            this.uniforms.uNoise = noise;
            this.uniforms.time = 0;
        }        
    }

    export class WaterSurface implements SceneObject {
        private filter! : FlowFilter;

        public init (loader: PIXI.Loader, resources: any, app : PIXI.Application) : void {

            let water =  new PIXI.Sprite ( PIXI.Loader.shared.resources["water"].texture);
            let flowMap = new PIXI.Sprite ( PIXI.Loader.shared.resources["flowmap"].texture);  
            let bump = new PIXI.Sprite ( PIXI.Loader.shared.resources["bump"].texture);
            let noise = new PIXI.Sprite (PIXI.Loader.shared.resources["noise"].texture);

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