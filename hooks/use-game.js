import useWebGL from '@/hooks/use-webgl'
import useGUI from '@/hooks/use-gui'
import useAssetsManager from '@/hooks/use-manager'

import ToonMaterial from '@/webgl/materials/toon.js'

import raf from '@/plugins/raf'

let game

class Game {
  constructor() {
    const { scene } = useWebGL()

    this.scene = new THREE.Group()
    this.scene.scale.setScalar(100)

    scene.add(this.scene)

    this.init()
  }

  async init() {
    this.initCamera()
    this.initLights()

    this.addBox()
    this.addFloor()
    await this.addFactory()

    this.initGUI()

    raf.add('use-game', this.loop.bind(this), 1)
  }

  initCamera() {
    const { scene, camera } = useWebGL()

    camera.position.set(500, 500, 500)
    camera.lookAt(scene.position)
  }

  initLights() {
    const { scene } = useWebGL()

    scene.background = new THREE.Color(0x000000)

    this.ambientLight = new THREE.AmbientLight(0x383838, 0)
    scene.add(this.ambientLight)

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    this.directionalLight.position.set(512, 512, 512)
    scene.add(this.directionalLight)
    this.directionalLight.lookAt(new THREE.Vector3())

    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = 4096
    this.directionalLight.shadow.mapSize.height = 4096
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 2048
    this.directionalLight.shadow.camera.left = -2048
    this.directionalLight.shadow.camera.top = 2048
    this.directionalLight.shadow.camera.right = 2048
    this.directionalLight.shadow.camera.bottom = -2048
    this.directionalLight.shadow.bias = 0.005

    this.directionalLightHelper = new THREE.DirectionalLightHelper(
      this.directionalLight,
      100
    )
    scene.add(this.directionalLightHelper)

    const shadowHelper = new THREE.CameraHelper(
      this.directionalLight.shadow.camera
    )
    scene.add(shadowHelper)
  }

  addFloor() {
    const { scene } = useWebGL()

    const geometry = new THREE.PlaneBufferGeometry(1, 1)
    this.shadowsMaterial = new THREE.ShadowMaterial({
      color: Math.floor(Math.random() * 16777215)
    })

    this.floor = new THREE.Mesh(geometry, this.shadowsMaterial)
    this.floor.receiveShadow = true
    this.floor.position.y = -0.1

    this.floor.scale.setScalar(10000, 10000, 10000)
    this.floor.rotation.x = THREE.MathUtils.degToRad(-90)

    scene.add(this.floor)
  }

  addBox() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new ToonMaterial({
      color: Math.floor(Math.random() * 16777215),
      emissive: Math.floor(Math.random() * 16777215)
    })
    this.cube = new THREE.Mesh(geometry, material)
    this.scene.add(this.cube)

    const { raycaster } = useWebGL()

    raycaster.addTarget(this.cube)

    raycaster.events.on('intersection', (intersections) => {
      const cubeIsIntersected = intersections.filter(
        (intersection) => intersection.object.uuid === this.cube.uuid
      )

      if (cubeIsIntersected[0]) {
        this.cube.scale.setScalar(1.1)
      } else {
        this.cube.scale.setScalar(1)
      }
    })
  }

  loadFactoryModel() {
    const manager = useAssetsManager()

    manager.loader.addGroup({
      name: 'factory',
      base: '/',
      files: [
        {
          name: 'factory',
          path: 'obj/factory.glb'
        }
      ]
    })
    return manager.get('factory')
  }

  async addFactory() {
    const { raycaster } = useWebGL()
    const gui = useGUI()
    const { factory } = await this.loadFactoryModel()

    // factory.scene.scale.setScalar(100)
    factory.scene.traverse((child) => {
      child.parentUUID = factory.scene.uuid
      child.material = new ToonMaterial({
        color: Math.floor(Math.random() * 16777215),
        emissive: Math.floor(Math.random() * 16777215)
      })
      child.castShadow = true
      child.receiveShadow = true
    })

    this.scene.add(factory.scene)

    raycaster.addTarget(factory.scene)

    // raycaster.events.on('intersection', (intersections) => {
    //   const factoryIntersections = intersections.filter(
    //     (intersection) => intersection.object.parentUUID === factory.scene.uuid
    //   )

    //   if (factoryIntersections.length) {
    //     const selectedPart = factoryIntersections[0].object
    //     selectedPart.material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    //   } else {
    //     factory.scene.traverse((child) => {
    //       child.material = new THREE.MeshNormalMaterial()
    //     })
    //   }
    // })

    gui.addObject3D('factory', factory.scene)
  }

  initGUI() {
    const { scene } = useWebGL()
    const gui = useGUI()
    const color = new THREE.Color()
    const params = {
      'background color': color.copyLinearToSRGB(scene.background).getHex()
    }

    // scene
    const sceneGUI = gui.addFolder('scene')

    sceneGUI
      .addColor(params, 'background color')
      .name('background')
      .onChange(() => {
        scene.background
          .setHex(params['background color'])
          .convertSRGBToLinear()
      })

    // shadows
    gui.addMaterial('shadows', this.shadowsMaterial)

    const shadowGUI = gui.__folders.shadows
      ? gui.__folders.shadows
      : gui.addFolder('shadows')
    shadowGUI.add(this.directionalLight.shadow, 'bias').step(0.0001)
  }

  loop() {
    const { clock } = useWebGL()
    clock.getDelta()

    const time = clock.getElapsedTime()

    this.directionalLight.position.x = Math.sin(time * 0.1) * 1000
    this.directionalLight.position.z = Math.cos(time * 0.1) * 1000
    this.directionalLightHelper.update()
  }

  destroy() {}
}

const useGame = () => {
  return game || (game = new Game())
}

export default useGame
