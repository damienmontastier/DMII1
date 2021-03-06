import vertexShader from '@/webgl/materials/dots-pattern/vertex.glsl'
import fragmentShader from '@/webgl/materials/dots-pattern/fragment.glsl'

import useGUI from '@/hooks/use-gui'

export default class DotsPlane extends THREE.Object3D {
  constructor({
    noiseAmplitude = 0.0025,
    noiseFrequency = 10,
    dotsFrenquency = 100,
    dotsRadius = 0.2,
    color = 0x2ff000
  } = {}) {
    super()

    this.renderOrder = 0.001

    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 100, 100)

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {
          value: 0
        },
        uNoiseAmplitude: {
          value: noiseAmplitude
        },
        uNoiseFrequency: {
          value: noiseFrequency
        },
        uDotsFrenquency: {
          value: dotsFrenquency
        },
        uDotsRadius: {
          value: dotsRadius
        },
        uOffset: {
          value: new THREE.Vector2(0, 0)
        },
        uColor: {
          value: new THREE.Color(color)
        }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      extensions: {
        derivatives: true
      }
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.add(this.mesh)

    this.initGUI()
  }

  update(clock) {
    this.material.uniforms.uTime.value = clock.time * 0.2
  }

  initGUI() {
    const GUI = useGUI()
    const dotsGUI = GUI.addFolder('dots pattern')
    dotsGUI
      .add(this.material.uniforms.uDotsFrenquency, 'value')
      .min(0)
      .max(1000)
      .name('dots frequency')
    dotsGUI
      .add(this.material.uniforms.uDotsRadius, 'value')
      .min(0)
      .max(1)
      .step(0.01)
      .name('dots radius')
    dotsGUI
      .add(this.material.uniforms.uNoiseAmplitude, 'value')
      .min(0)
      .max(0.1)
      .step(0.001)
      .name('noise amplitude')
    dotsGUI
      .add(this.material.uniforms.uNoiseFrequency, 'value')
      .min(0)
      .max(20)
      .step(0.1)
      .name('noise frequency')
  }
}
