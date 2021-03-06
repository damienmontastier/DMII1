// import { TweenLite } from 'gsap'
// import { RoughEase, Linear } from 'gsap'

import gsap from 'gsap'
import viewport from '@/plugins/viewport'
import mouse from '@/plugins/mouse'

import useRAF from '@/hooks/use-raf'
import useGUI from '@/hooks/use-gui'

import LEVEL01_CONFIG from '@/config/level01'

let camera

// TODO : camera shake
// TODO : mouse move

class Camera {
  constructor() {
    // super()
    gsap.registerPlugin(CustomEase)
    gsap.registerPlugin(CustomWiggle)

    this.camera = new THREE.PerspectiveCamera(
      40,
      viewport.width / viewport.height,
      0.1,
      100000
    )

    this._normalizedAngle = LEVEL01_CONFIG.cameras.default.normalized_angle.clone()
    this._distance = LEVEL01_CONFIG.cameras.default.distance

    this._position = new THREE.Vector3()

    this._shake = new THREE.Vector3()
    this._mouse = new THREE.Vector2()

    // events
    this.onWindowResizeHandler = this.onWindowResize.bind(this)
    viewport.events.on('resize', this.onWindowResizeHandler)

    this.onMouseMoveHandler = this.onMouseMove.bind(this)
    mouse.events.on('mousemove', this.onMouseMoveHandler)

    const RAF = useRAF()
    RAF.add('camera', this.loop.bind(this))

    this.initGUI()
  }

  onMouseMove() {
    gsap.to(this._mouse, {
      duration: 2,
      ease: 'power4.out',
      x: mouse.normalized.x * 0.2,
      y: mouse.normalized.y * 0.4
    })
  }

  get _angle() {
    return this._normalizedAngle.clone().multiplyScalar(this._distance)
  }

  get _computedPosition() {
    return this._position
      .clone()
      .add(this._shake)
      .add(new THREE.Vector3(this._mouse.x, this._mouse.y, 0))
  }

  loop() {
    this.camera.position.copy(this._computedPosition)
  }

  shake() {
    CustomWiggle.create('myWiggle', { wiggles: 8, type: 'easeOut' })
    gsap.to(this._shake, {
      duration: 0.8,
      x: 0.2,
      ease: 'myWiggle'
    })
  }

  initGUI() {
    const GUI = useGUI()
    GUI.camera
      .add(this.camera, 'fov')
      .min(10)
      .max(100)
      .onChange(() => {
        this.onWindowResize()
      })

    GUI.camera
      .add(this, '_distance')
      .name('distance')
      .min(1)
      .max(10)

    GUI.camera.addVector('normalized angle', this._normalizedAngle)
  }

  onWindowResize() {
    this.camera.aspect = viewport.width / viewport.height

    this.camera.updateProjectionMatrix()
  }

  destroy() {
    viewport.events.off('resize', this.onWindowResizeHandler)
    mouse.events.off('mousemove', this.onMouseMoveHandler)
  }
}

const useCamera = () => {
  return camera || (camera = new Camera())
}

export default useCamera
