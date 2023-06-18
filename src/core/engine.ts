import * as BABYLON from "babylonjs";
//@ts-ignore
import HavokPhysics from "@babylonjs/havok";

export class System {
    private _started : boolean = false;
    private _engine: BABYLON.Engine;
    private _currentScene?: Scene;
    public ratio: number;

    constructor(canvas: HTMLCanvasElement) {
        this._engine = new BABYLON.Engine(canvas, true);
        this.ratio = canvas.width / canvas.height;
    }

    get engine() : BABYLON.Engine {
        return this._engine;
    }

    start() {
        this._started = true;
    }

    setScene(scene: Scene) {
        if (this._currentScene != undefined) {
            this._engine.stopRenderLoop();
        }
        this._currentScene = scene;
        this._engine.runRenderLoop(() => {
            if (this._started)
                this._currentScene?.render();
        })
    }

    resize(canvas: HTMLCanvasElement) {
        this.ratio = canvas.width / canvas.height;
        this._engine.resize();
    }
}

export abstract class Scene {
    protected validPhysics: boolean = false;
    protected engine: BABYLON.Engine;
    protected scene: BABYLON.Scene;
    protected camera: BABYLON.FreeCamera;
    protected light: BABYLON.Light;

    constructor(_engin: BABYLON.Engine, _validPhysics:boolean = false) {
        this.validPhysics = _validPhysics;
        this.engine = _engin;
        this.scene = new BABYLON.Scene(this.engine);
        this.camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -40), this.scene);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 20 , -10), this.scene);
        this.init();
    }

    init() : void {
        if (this.validPhysics) {
            HavokPhysics({locateFile: () => "/HavokPhysics.wasm"}).then((havok:any) => {
                var gravity = new BABYLON.Vector3(0, -9.8, 0);
                var plugin = new BABYLON.HavokPlugin(true, havok);
                this.scene.enablePhysics(gravity, plugin);
                this.start();
                this.scene.registerAfterRender(this.update);
            });
        } else {
            this.start();
            this.scene.registerAfterRender(this.update);
        }
    }

    abstract start(): void;

    abstract update() : void;

    render() {
        this.scene.render();
    }

    dispose(): void {
        this.scene.dispose();
    }
}

export abstract class MeshObject {
    private scene: BABYLON.Scene;
    public name: string;
    public mesh: BABYLON.Mesh;
    public physicsAggregate?: BABYLON.PhysicsAggregate;

    constructor(name: string, mesh: BABYLON.Mesh, scene: BABYLON.Scene) {
        this.name = name;
        this.scene = scene;
        this.mesh = mesh;
    }

    texture(textureFileName: string): void {
        const mat = new BABYLON.StandardMaterial(this.name);
        mat.diffuseTexture = new BABYLON.Texture(textureFileName);
        mat.diffuseTexture.hasAlpha = true;
        this.mesh.material = mat;
    }

    addPhysics(type: BABYLON.PhysicsShapeType, options: BABYLON.PhysicsAggregateParameters) : void {
        if (this.physicsAggregate == undefined)
            this.physicsAggregate = new BABYLON.PhysicsAggregate(this.mesh, type, options, this.scene);
    }

    removePhysics() {
        this.physicsAggregate?.dispose();
        this.physicsAggregate = undefined;
    }

    setCollisionCollbackEnable(enabled: boolean) {
        this.physicsAggregate?.body.setCollisionCallbackEnabled(enabled);
    }

    setCollisionObserver(callback:(event:BABYLON.IPhysicsCollisionEvent) => void) {
        this.setCollisionCollbackEnable(true);
        this.physicsAggregate?.body.getCollisionObservable().add(callback);
    }

    dispose() {
        this.removePhysics();
        this.mesh.dispose();
    }

    get position() : BABYLON.Vector3 {
        return this.mesh.position;
    }

    set position(pos: BABYLON.Vector3) {
        this.mesh.position = pos;
    }

    get body(): BABYLON.PhysicsBody {
        return this.physicsAggregate?.body!;
    }
}

export class BoxObject extends MeshObject {
    constructor(name: string, options: object, scene: BABYLON.Scene) {
        const box = BABYLON.MeshBuilder.CreateBox(name, options, scene);
        super(name, box, scene);
    }
}

export class GroundObject extends MeshObject {
    constructor(name: string, options: object, scene: BABYLON.Scene) {
        const ground = BABYLON.MeshBuilder.CreateGround(name, options, scene);
        super(name, ground, scene);
    }
}

export class SphereObject extends MeshObject {
    constructor(name: string, options: object, scene: BABYLON.Scene) {
        const sphere = BABYLON.MeshBuilder.CreateSphere(name, options, scene);
        super(name, sphere, scene);
    }
}

export class PlaneObject extends MeshObject {
    constructor(name: string, options: object, scene: BABYLON.Scene) {
        const plane = BABYLON.MeshBuilder.CreatePlane(name, options, scene);
        super(name, plane, scene);
    }
}