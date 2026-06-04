import { onStart } from "./opengl.js";
import { Pane } from "tweakpane";

window.addEventListener("load", () => {

    const pane = new Pane({
        title: 'roudness',
    });

    window.fractalColors = {
        color: {
            r: 190,
            g: 36,
            b: 36
        }
    };

    pane.addBinding(window.fractalColors, 'color', {
        label: 'Fractal color'
    });

    const btn = pane.addButton({
        title: 'Reset zoom and position',
    });

    btn.on('click', () => {
        window.azimuth = 0.0;
        window.elevation = 0.2;
        window.camDistance = 2.8;
        window.UpdateMatrices();
        console.log('Reset position & zoom!');
    });

    const btn1 = pane.addButton({
        title: 'Reset color',
    });

    btn1.on('click', () => {
        window.fractalColors.color.r = 190;
        window.fractalColors.color.g = 36;
        window.fractalColors.color.b = 36;
        pane.refresh();
        console.log('Reset color!');
    });

    window.roudness = { size: 1.5 };

    pane.addBinding(window.roudness, 'size', {
        min: 1,
        max: 2.5,
        step: 0.01,
        label: 'roudness'
    });

    onStart();
    console.log('onStart completed!');
});