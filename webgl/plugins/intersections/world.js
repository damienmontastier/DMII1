import * as THREE from 'three'

export default class World extends THREE.Object3D {
  constructor() {
    super()

    this.hitboxes = new THREE.Group()

    this.add(this.hitboxes)
  }

  addHitbox(hitbox) {
    this.hitboxes.add(hitbox)
  }

  removeHitbox(hitbox) {
    this.hitboxes.remove(hitbox)
  }

  intersects() {
    this.intersectsCounter = 0
    // get intersections
    let hitboxes = this.hitboxes.children

    // intersects if hitbox not sleeping
    hitboxes = hitboxes.filter((hitbox) => !hitbox.sleeping)

    hitboxes.forEach((hitbox) => {
      let targets = this.hitboxes.children

      // intersects if hitbox filters includes target layers
      if (hitbox.filters) {
        targets = targets.filter((target) =>
          hitbox.filters.some((filter) => target._layers.includes(filter))
        )
      }

      targets.forEach((target) => {
        if (hitbox.uuid !== target.uuid) {
          this.intersectsCounter++

          const lastIntersecting = hitbox.intersections[target.uuid]
            ? hitbox.intersections[target.uuid].intersecting
            : undefined

          const intersecting = hitbox.box.intersectsBox(target.box)

          const needsUpdate = intersecting !== lastIntersecting

          hitbox.intersections[target.uuid] = {
            lastIntersecting,
            intersecting,
            needsUpdate,
            target
          }
        }
      })
    })

    // emit collision events
    this.hitboxes.children.forEach((hitbox) => {
      hitbox.events.emit('intersecting', Object.values(hitbox.intersections))

      const intersections = Object.values(hitbox.intersections).filter(
        (intersection) => intersection.needsUpdate
      )

      if (intersections.length) {
        hitbox.events.emit('intersection', intersections)
      }
    })

    // console.log('intersections :', this.intersectsCounter)
  }

  step() {
    let hitboxes = this.hitboxes.children

    hitboxes = hitboxes.filter((hitbox) => !hitbox.kinematic)

    hitboxes.forEach((hitbox) => {
      hitbox.update()
    })

    this.intersects()
  }

  destroy() {
    this.remove(this.hitboxes)
  }
}
