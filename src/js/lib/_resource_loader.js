import * as THREE from 'three';
import "./VTKLoader";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function loadModel(urlData) {

    const urlParts = urlData.url.split('/');
    const modelFile = urlParts[urlParts.length - 1];
    const modelFileParts = modelFile.split('.');

    // const modelName = modelFileParts[0];
    const modelType = modelFileParts[1];

    return new Promise((resolve, reject) => {

        let loader;
        if (modelType.toUpperCase().startsWith('GL')) {
            loader = new GLTFLoader();
        } else if (modelType.toUpperCase() === 'VTK') {
            loader = new THREE.VTKLoader();
        }

        loader.load(
            urlData.url,
            model => {
                model.name = urlData.url;
                resolve(model);
            },
            undefined,
            error => reject(error)
        );

    });

}


export function loadImage(imgUrl) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(imgUrl, texture => resolve(texture));
    });
}


export function loadFont(fontUrl) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.FontLoader();
        loader.load(
            fontUrl,
            font => resolve(font)
        );
    });
}


export function loadText(textFileUrl) {
    return new Promise((resolve, reject) => {
        $.get(
            textFileUrl,
            text => resolve(text)
        );
    });
}