import { Camera, Euler, Light, PointLight, Vector2, Vector3 } from 'three';
import * as S from './saves'
import Cookies from 'js-cookie'
import { Pane } from 'tweakpane';

const CURR_VERSION_NAME = 'v 1.6';

export function clearCache() {
	console.log("cleared Game Cookies");
	for (var name in Cookies.get()) {
		Cookies.remove(name)
	}
}

if (S.Get("versionName", CURR_VERSION_NAME) !== CURR_VERSION_NAME) {
	clearCache();
}

S.Set("versionName", CURR_VERSION_NAME);

var options = {

	hasDebug: S.Get("hasDebug", false),

	gui: new Pane({ title: CURR_VERSION_NAME, expanded: true }),
	hasLocal: location.host.includes("localhost"),

	position: S.Get("position", new Vector3(2.17, 1.22, 1.74)),
	rotation: S.Get("rotation", new Vector3(-0.61, 0.79, 0.46)),


	initCamera: (camera: Camera) => {
		camera.position.copy(options.position);
		camera.setRotationFromEuler(new Euler(options.rotation.x, options.rotation.y, options.rotation.z));
		// console.log(options.position, options.rotation);


		options.gui.addButton({ title: "export" }).on('click', () => {
			console.log(options.gui.exportPreset());
		})

		const cameraFolder = options.gui.addFolder({ title: "Camera", expanded: false });

		cameraFolder.addInput(options, "position").on('change', (ev) => {
			options.position = S.Set("position", ev.value);
			camera.position.copy(options.position);
		})

		cameraFolder.addInput(options, "rotation").on('change', (ev) => {
			options.rotation = S.Set("rotation", ev.value);
			camera.setRotationFromEuler(new Euler(options.rotation.x, options.rotation.y, options.rotation.z));
		});

	},
	updateCamera: (camera: Camera) => {
		if (!options.hasDebug) return;
		if (options.gui.hidden || !options.gui.expanded) return;
		options.position = S.Set("position", camera.position);
		S.Set("rotation", new Vector3(camera.rotation.x, camera.rotation.y, camera.rotation.z));
		const saved = options.position;
		try {
			options.position = S.Set("position", camera.position);
			options.gui.refresh()
		} catch (ex) {
			S.Set("position", saved);
		}
	},
	//###################
	// Project vars

	objectColor: S.Get("objectColor", '#93deea'),
	backColor: S.Get("backColor", '#000000'),


	objectAlpha: S.Get("objectAlpha", 1.0),

	duration: 800,
	percentD: 0.85,
	countC: 5,

	dPos: S.Get("dPos", new Vector3(0.01, 1.00, 1.01)),
	dRot: S.Get("dRot", new Vector3(5.50, 0.10, 5)),
	//_________

	light1: {
		pos: S.Get("light1_pos", new Vector3(1.1, 0.8, 8.7)),
		color: S.Get("light1_col", '#ffffff'),
		intensity: S.Get("light1_int", 1.01)
	},
	light2: {
		pos: S.Get("light2_pos", new Vector3(8.5,6.4,1.7)),
		color: S.Get("light2_col", '#ffffff'),
		intensity: S.Get("light2_int", 1.2)
	},
	initLight: (id: number) => {
		if (id == 1) {
			var light = new PointLight(options.light1.color, options.light1.intensity);
			light.position.copy(options.light1.pos);
			return light;
		}
		if (id == 2) {
			var light = new PointLight(options.light2.color, options.light2.intensity);
			light.position.copy(options.light2.pos);
			return light;
		}
		throw new Error("light not finedd");
	},

	//________
	asciEffect: {
		charSet: ' +*01F%@',

		resolution: 0.2,
		scale: 1.0,

		bColor: false,
		bAlpha: false,
		bBlock: false,
		invert: true,
		strResolution: 'low',//medium,high

		colorChar: "#404040",
	},
};


const setDebugMode = (enable: boolean = options.hasDebug) => {
	options.hasDebug = S.Set("hasDebug", enable);
	options.gui.hidden = enable == false;
}
setDebugMode();
export { options, setDebugMode }