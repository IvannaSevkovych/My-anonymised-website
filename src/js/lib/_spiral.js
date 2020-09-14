import * as THREE from 'three';

export function SpiralCurve(parameters) {

	THREE.Curve.call(this);

	this.scale = (parameters.scale === undefined) ? 1 : parameters.scale;
	this.turns = (parameters.turns === undefined) ? 1 : parameters.turns;
	this.radius = (parameters.radius === undefined) ? 1 : parameters.radius;
	this.depth = (parameters.depth === undefined) ? 1 : parameters.depth;

}

SpiralCurve.prototype = Object.create(THREE.Curve.prototype);
SpiralCurve.prototype.constructor = SpiralCurve;

SpiralCurve.prototype.getPoint = function (t) {

	var tx = this.radius * Math.cos(this.turns*5 * 2 * Math.PI * t) * (1 - t);
	var ty = this.radius * Math.sin(this.turns*5 * 2 * Math.PI * t) * (1 - t);
	var tz = this.depth * this.turns * t;

	return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

};