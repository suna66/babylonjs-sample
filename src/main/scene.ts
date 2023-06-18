import * as BABYLON from "babylonjs";
import { Scene, BoxObject, GroundObject, SphereObject } from "@/core/engine";


export default class MainScene extends Scene {
    private box: BoxObject;
    private ground: GroundObject;
    private sphereList: SphereObject[];

    constructor(engine: BABYLON.Engine) {
        super(engine, true);
        this.box = new BoxObject("box", {size: 4}, this.scene);
        this.ground = new GroundObject("ground", {width:100, height:100}, this.scene);
        this.sphereList = [];
    }

    start = () : void => {
        this.box.mesh.position = new BABYLON.Vector3(0, 5, 50);
        this.box.texture("/awesomeface.png");
        this.box.addPhysics(BABYLON.PhysicsShapeType.BOX, {mass: 0.1, restitution: 1});
        this.ground.mesh.position = new BABYLON.Vector3(0, -5, 0);
        this.ground.addPhysics(BABYLON.PhysicsShapeType.BOX, {mass: 0 });

        this.scene.onPointerDown = (event: BABYLON.IPointerEvent, _pickResult : BABYLON.PickingInfo) => {
            if (event.button == 0) {
                var res = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
                console.log(res);
                const sphere = new SphereObject("sphere", {diameter:2, segments:32}, this.scene);
                sphere.texture("/awesomeface.png");
                sphere.mesh.position = new BABYLON.Vector3(res.ray?.direction.x! * 10, res.ray?.direction.y! * 10, -30);
                sphere.addPhysics(BABYLON.PhysicsShapeType.SPHERE, {mass:1, restitution: 1});
                sphere.setCollisionObserver((physicsEvent:BABYLON.IPhysicsCollisionEvent) => {
                    if (physicsEvent.collidedAgainst === this.box.body) {
                        this.restartTarget();
                    }
                });
                sphere.body.applyImpulse(new BABYLON.Vector3(sphere.mesh.position.x, 5, 20), sphere.mesh.position);
                this.sphereList.push(sphere);
            }
        }
    }

    update = () : void => {
        var deletedIndex = -1;

        for (var i = 0; i < this.sphereList.length; i++) {
            const mesh = this.sphereList[i].mesh;
            if (mesh.position.z < -100) {
                deletedIndex = i;
                break;
            }
        }
        if (deletedIndex != -1) {
            const mesh = this.sphereList[deletedIndex].mesh;
            this.sphereList.splice(deletedIndex, 1);
            mesh.dispose();
        }
        this.box.body.applyForce(new BABYLON.Vector3(0, 0, -0.5), this.box.position);
        if (this.box.position.z < -30) {
            this.restartTarget();
        }
    }

    restartTarget = () => {
        this.box.removePhysics();
        var x = Math.random() * 20 - 10;
        var y = Math.random() * 10;
        this.box.mesh.position = new BABYLON.Vector3(x, y, 50);
        this.box.addPhysics(BABYLON.PhysicsShapeType.BOX, {mass: 0.1, restitution: 1});  
    }
}
