import "@/style.css";
import { System } from "@/core/engine";
import MainScene from "@/main/scene";

window.addEventListener("load", () => {
    const canvas = document.getElementById("render") as HTMLCanvasElement;
    canvas.width = window.document.documentElement.clientWidth;
    canvas.height = window.document.documentElement.clientHeight;

    //init
    const sys = new System(canvas);
    const scene = new MainScene(sys.engine);
    sys.setScene(scene);
    sys.start();

    window.addEventListener("resize", () => {
        canvas.width = window.document.documentElement.clientWidth;
        canvas.height = window.document.documentElement.clientHeight;
        sys.resize(canvas);
    });
});
