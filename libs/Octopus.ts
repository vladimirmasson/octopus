import * as THREE from 'three';

import { AsciiEffect } from './helper/AsciiEffect';
import { options } from './helper/options';
import * as S from './helper/saves'


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader'


import { AnimationClip, AnimationMixer, Camera, Clock, Color, Group, MaterialLoader, Mesh, MeshPhongMaterial, PlaneGeometry, PointLight, Scene, Vector3 } from 'three';
import { Keyboard } from './helper/Keyboard';
import { Safety } from './helper/Safety';

class Octopus {
	constructor() {
		this.baseInit();
		this.initEffect();

		this.controls = new OrbitControls(this.camera, document.getElementById("orbitControl"));

		// this.controls.autoRotate = false;
		// this.controls.autoRotateSpeed = 0.5;

		window.addEventListener('resize', () => { this.onWindowResize(); }, false);
		this.onWindowResize();

		this.initDatGUI();
		this.loadObj();
		this.draw();
	}


	get width(): number { return this.canvas.parentElement.clientWidth; }
	get height(): number { return this.canvas.parentElement.clientHeight + 300 };
	get FOV(): number {return 60}

	material
	render: THREE.WebGLRenderer
	controls: OrbitControls | null
	scene: Scene
	camera: THREE.PerspectiveCamera

	keyboard = new Keyboard();
	sphere: THREE.Mesh;
	asciEfeffect: AsciiEffect | null;
	canvas: HTMLElement;

	pLight1: PointLight
	pLight2: PointLight
	baseInit() {

		this.canvas = document.getElementById("canvas");
		this.canvas.style.opacity = options.objectAlpha;

		this.scene = new THREE.Scene();
		
		//@ts-ignore
		this.render = new THREE.WebGLRenderer({ /* antialias: true, */ canvas: this.canvas });
		// render.setPixelRatio(window.devicePixelRatio);
		// render.setSize(window.innerWidth, window.innerHeight);
		this.render.setClearColor("#000000");

		//Camera
		this.camera = new THREE.PerspectiveCamera(this.FOV, this.width / this.height, 1, 20000);
		options.initCamera(this.camera);

		this.scene.add(this.camera);

		//Lights
		this.pLight1 = options.initLight(1)
		this.scene.add(this.pLight1);

		this.pLight2 = options.initLight(2)
		this.scene.add(this.pLight2);
	}


	enableRender = true;
	onWindowResize() {


		if (window.innerHeight <= 600) {
			this.enableRender = false;

			if (this.asciEfeffect) {
				this.asciEfeffect.domElement.remove();
			}
			this.asciEfeffect = null;
			return;
		} else {
			this.enableRender = true;
			if (!this.asciEfeffect) {
				this.initEffect();
			}
		}

		if (window.innerWidth <= 590) {
			(options.dPos as Vector3).x = 0.61;
		} else {
			(options.dPos as Vector3).x = 0.1;
		}
		this.updateDPosOctopus();

		this.camera.fov = this.FOV;
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();

		this.render.setSize(this.width, this.height);
		this.asciEfeffect.setSize(this.width, this.height);
	}

	updateDPosOctopus() {
		this.octopusObjects?.position.copy(options.dPos);
		this.octopusObjects?.rotation.setFromVector3(options.dRot);
	}


	private initEffect(onlyClear: boolean = false) {
		if (this.asciEfeffect) {
			this.asciEfeffect.domElement.remove();
		}

		this.asciEfeffect = new AsciiEffect(this.render,
			options.asciEffect.charSet,
			{
				resolution: options.asciEffect.resolution,
				scale: options.asciEffect.scale,
				// bColor: options.asciEffect.bColor,
				// bAlpha: options.asciEffect.bAlpha,
				// bBlock: options.asciEffect.bBlock,
				invert: options.asciEffect.invert,
				strResolution: options.asciEffect.strResolution,
			});
		this.asciEfeffect.setSize(this.width, this.height);
		//@ts-ignore
		this.asciEfeffect.domElement.children[0].style.color = options.asciEffect.colorChar;
		// this.asciEfeffect.domElement.style.backgroundColor = '#' + options.backColor;
		this.asciEfeffect.domElement.id = "effectAsci"

		this.canvas.parentElement.appendChild(this.asciEfeffect.domElement);
	}


	scaleWindowGui: dat.GUI
	skyGui: dat.GUI
	folderWeed: dat.GUI
	private initDatGUI() {

		options.gui.addInput(options, 'backColor').on('change', (ev) => {
			S.Set("backColor", ev.value);

			this.scene.background = new THREE.Color(ev.value);
		});

		options.gui.addInput(options, "objectColor").on('change', (ev) => {
			S.Set("objectColor", ev.value);
			//@ts-ignore
			this.octopus.material.color = new Color(ev.value)
			// this.asciEfeffect.domElement.style.color = 'white';
		});

		options.gui.addInput(options, "objectAlpha", { min: 0.0, max: 1, step: 0.001 }).on('change', (ev) => {
			S.Set("objectAlpha", ev.value);
			//@ts-ignore
			this.canvas.style.opacity = ev.value;
			// this.octopusObject.material.opacity = value;
		});

		const foladerDPos = options.gui.addFolder({ title: "dPos Octopus", expanded: false });
		foladerDPos.addInput(options, "dPos").on('change', (ev) => {
			options.dPos = S.Set("dPos", ev.value);
			this.updateDPosOctopus();
		})

		foladerDPos.addInput(options, "dRot").on('change', (ev) => {
			options.dRot = S.Set("dRot", ev.value);
			this.updateDPosOctopus();
		});

		//_________
		const light_1 = options.gui.addFolder({ title: "Light 1", expanded: false });
		const updateLight1 = (ev) => {
			this.pLight1.color.set(options.light1.color);
			this.pLight1.intensity = options.light1.intensity;
			this.pLight1.position.copy(options.light1.pos)
		}
		light_1.addInput(options.light1, "pos").on('change', updateLight1)
		light_1.addInput(options.light1, "color").on('change', updateLight1)
		light_1.addInput(options.light1, "intensity").on('change', updateLight1)
		//___
		const light_2 = options.gui.addFolder({ title: "Light 2", expanded: false });
		const updateLight2 = (ev) => {
			this.pLight2.color.set(options.light2.color);
			this.pLight2.intensity = options.light2.intensity;
			this.pLight2.position.copy(options.light2.pos)
		}
		light_2.addInput(options.light2, "pos").on('change', updateLight2)
		light_2.addInput(options.light2, "color").on('change', updateLight2)
		light_2.addInput(options.light2, "intensity").on('change', updateLight2)
		//###########################

		const asciEffectFolder = options.gui.addFolder({ title: "asciEffect", expanded: true });
		const onChange = (ev) => {
			this.initEffect()
		}
		asciEffectFolder.addInput(options.asciEffect, "charSet").on('change', onChange)
		asciEffectFolder.addInput(options.asciEffect, "resolution", { min: 0.1, max: 2.0, step: 0.01 }).on('change', onChange)
		asciEffectFolder.addInput(options.asciEffect, "scale", { min: 0.1, max: 3.0, step: 0.01 }).on('change', onChange)
		// asciEffectFolder.addInput(options.asciEffect, "bColor").on('change', onChange)
		// asciEffectFolder.addInput(options.asciEffect, "bAlpha").on('change', onChange)
		// asciEffectFolder.addInput(options.asciEffect, "bBlock").on('change', onChange)
		asciEffectFolder.addInput(options.asciEffect, "invert").on('change', onChange)

		asciEffectFolder.addInput(options.asciEffect, 'strResolution', {
			options: {
				'low': 'low',
				'medium': 'medium',
				'high': 'high',
			}
		}).on('change', onChange);



		asciEffectFolder.addInput(options.asciEffect, 'colorChar').on('change', onChange);
	}

	parentOctopus = new Group();
	octopusObjects: THREE.Object3D | null;
	octopus: THREE.Object3D | null;
	mixer: AnimationMixer | null;

	private objLoadingComplete(object) {
		this.octopusObjects = (object.scene as Scene).children[1];

		this.mixer = new THREE.AnimationMixer(this.octopusObjects);

		var animClip = object.animations[0] as THREE.AnimationClip;
		animClip.trim();
		const action = this.mixer.clipAction(animClip);
		action.play();


		this.octopus = this.octopusObjects.children[1];
		//@ts-ignore
		this.octopus.material.color = new Color(options.objectColor)

		this.parentOctopus.add(this.octopusObjects);
		this.scene.add(this.parentOctopus);

		this.octopusObjects.scale.set(2, 2, 2)

		this.octopusObjects.position.copy(options.dPos);
		this.octopusObjects.rotation.setFromVector3(options.dRot);
	}


	loaded = 0;
	private loadObj() {
		const loader = new ColladaLoader();
		loader.load('assets/object.dae',

			(obj) => {
				this.objLoadingComplete(obj)
				this.loaded = 1;
			},

			function (xhr) {
				this.loaded = xhr.loaded / xhr.total;
				this.loaded = Math.min(this.loaded, 1);
				console.log((xhr.loaded / xhr.total * 100) + '% loaded', this.loaded);
			},

			function (error) {
				console.log('An error happened', error);
			}
		);
		//___________
		// },
		// 	function (xhr) {
		// 		console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		// 	},
		// 	function (error) {
		// 		console.log('An error happened');
		// 	})
	}

	timer = new Clock(true);

	// start_angle: number | null = null
	public rotate(percent: number) {
		// if (!this.start_angle) {
		// 	this.start_angle = this.octopus.rotation.y;
		// }
		// this.octopus.rotation.y = this.start_angle + Math.PI / 2 * percent;
		this.parentOctopus.rotation.y = Math.PI / 2 * percent;
	}


	containerControl: HTMLElement = document.getElementById("orbitControl")
	private draw() {
		if (Safety.check() && this.enableRender) {

			if (options.hasDebug) {
				this.canvas.style.display = 'block'
				this.controls.enabled = true;
				this.containerControl.style.position = 'relative';
				this.containerControl.style.zIndex = "1";
			} else {
				this.canvas.style.display = 'none'
				this.controls.enabled = false;
				this.containerControl.style.position = 'fixed';
				this.containerControl.style.zIndex = "-1";
			}
			if (this.keyboard.reload) return;
			options.updateCamera(this.camera);

			this.mixer?.update(this.timer.getDelta());
			this.asciEfeffect.render(this.scene, this.camera);

			this.controls?.update();
		}
		requestAnimationFrame(() => { this.draw() });
	}


}

export default Octopus;