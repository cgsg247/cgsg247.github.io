import { onStart } from "./opengl.js";
import { Pane } from "tweakpane";

window.addEventListener("load", () => {

    const pane = new Pane({
        title: 'roudness',
    });

    window.fractalColors = {
        color: {
            r: 5,
            g: 14,
            b: 2
        }
    };

    pane.addBinding(window.fractalColors, 'color', {
        label: 'Fractal color'
    });

    const btn = pane.addButton({
        title: 'Reset zoom and position',
    });

    btn.on('click', () => {
        window.mouse_wheel = 1.0;
        window.mouseX = 0.0;
        window.mouseY = 0.0;
        console.log('Reset position & zoom!');
    });

    const btn1 = pane.addButton({
        title: 'Reset color',
    });

    btn1.on('click', () => {
        window.fractalColors.color.r = 5;
        window.fractalColors.color.g = 14;
        window.fractalColors.color.b = 2;
        pane.refresh();
        console.log('Reset color!');
    });

    window.roudness = { size: 0.9 };

    pane.addBinding(window.roudness, 'size', {
        min: 0.9,
        max: 2,
        step: 0.01,
        label: 'roudness'
    });

    onStart();
    console.log('onStart completed!');
});