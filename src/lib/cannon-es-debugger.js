import { Vec3, Quaternion, Shape } from 'cannon-es';
import {
  MeshBasicMaterial,
  SphereGeometry,
  BoxGeometry,
  PlaneGeometry,
  Mesh,
  CylinderGeometry,
  BufferGeometry,
  Float32BufferAttribute,
  Line, Color, LineBasicMaterial
} from 'three';
import {LineGeometry} from "three/addons";

function CannonDebugger(scene, world, _temp) {
  let {
    color = 0x00ff00,
    scale = 1,
    onInit,
    onUpdate
  } = _temp === void 0 ? {} : _temp;
  const _meshes = [];

  const _material = new MeshBasicMaterial({
    color: color != null ? color : 0x00ff00,
    wireframe: true
  });

  const constraintsTypes = {
    PointToPointConstraint: 'PointToPointConstraint',
    ConeTwistConstraint: 'ConeTwistConstraint',
    DistanceConstraint: 'DistanceConstraint',
    HingeConstraint: 'HingeConstraint',
    LockConstraint: 'LockConstraint',
    Constraint: 'Constraint',
    Spring: 'Spring',
  }

  const nullVector_ = new Vec3();
  const _tempVec0 = new Vec3();

  const _tempVec1 = new Vec3();

  const _tempVec2 = new Vec3();

  const _tempQuat0 = new Quaternion();

  const _sphereGeometry = new SphereGeometry(1);

  const _boxGeometry = new BoxGeometry(1, 1, 1);

  const _planeGeometry = new PlaneGeometry(10, 10, 10, 10); // Move the planeGeometry forward a little bit to prevent z-fighting


  _planeGeometry.translate(0, 0, 0.0001);

  function isConstraint(shape) {
    return Object.values(constraintsTypes).includes(shape.constructor.name)
  }

  function createConvexPolyhedronGeometry(shape) {
    const geometry = new BufferGeometry(); // Add vertices

    const positions = [];

    for (let i = 0; i < shape.vertices.length; i++) {
      const vertex = shape.vertices[i];
      positions.push(vertex.x, vertex.y, vertex.z);
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3)); // Add faces

    const indices = [];

    for (let i = 0; i < shape.faces.length; i++) {
      const face = shape.faces[i];
      const a = face[0];

      for (let j = 1; j < face.length - 1; j++) {
        const b = face[j];
        const c = face[j + 1];
        indices.push(a, b, c);
      }
    }

    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    geometry.computeVertexNormals();
    return geometry;
  }

  function createTrimeshGeometry(shape) {
    const geometry = new BufferGeometry();
    const positions = [];
    const v0 = _tempVec0;
    const v1 = _tempVec1;
    const v2 = _tempVec2;

    for (let i = 0; i < shape.indices.length / 3; i++) {
      shape.getTriangleVertices(i, v0, v1, v2);
      positions.push(v0.x, v0.y, v0.z);
      positions.push(v1.x, v1.y, v1.z);
      positions.push(v2.x, v2.y, v2.z);
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();
    geometry.computeVertexNormals();
    return geometry;
  }

  function createHeightfieldGeometry(shape) {
    const geometry = new BufferGeometry();
    const s = shape.elementSize || 1; // assumes square heightfield, else i*x, j*y

    const positions = shape.data.flatMap((row, i) => row.flatMap((z, j) => [i * s, j * s, z]));
    const indices = [];

    for (let xi = 0; xi < shape.data.length - 1; xi++) {
      for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
        const stride = shape.data[xi].length;
        const index = xi * stride + yi;
        indices.push(index + 1, index + stride, index + stride + 1);
        indices.push(index + stride, index + 1, index);
      }
    }

    geometry.setIndex(indices);
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();
    geometry.computeVertexNormals();
    return geometry;
  }

  function createMesh(shape) {
    let mesh = new Mesh();

    if (isConstraint(shape)) {
      switch (shape.constructor.name) {
        case constraintsTypes.Spring: {
          mesh = createSpringConstraintMesh(shape)
          break;
        }
        case constraintsTypes.HingeConstraint: {
          mesh = createHingeConstraintMesh(shape)
          break;
        }
        default: {
          mesh = createConstraintMesh(shape)
        }
      }

    } else {
      const {
        SPHERE,
        BOX,
        PLANE,
        CYLINDER,
        CONVEXPOLYHEDRON,
        TRIMESH,
        HEIGHTFIELD
      } = Shape.types;

      switch (shape.type) {
        case SPHERE: {
          mesh = new Mesh(_sphereGeometry, _material);
          break;
        }

        case BOX: {
          mesh = new Mesh(_boxGeometry, _material);
          break;
        }

        case PLANE: {
          mesh = new Mesh(_planeGeometry, _material);
          break;
        }

        case CYLINDER: {
          const geometry = new CylinderGeometry(shape.radiusTop, shape.radiusBottom, shape.height, shape.numSegments);
          mesh = new Mesh(geometry, _material);
          shape.geometryId = geometry.id;
          break;
        }

        case CONVEXPOLYHEDRON: {
          const geometry = createConvexPolyhedronGeometry(shape);
          mesh = new Mesh(geometry, _material);
          shape.geometryId = geometry.id;
          break;
        }

        case TRIMESH: {
          const geometry = createTrimeshGeometry(shape);
          mesh = new Mesh(geometry, _material);
          shape.geometryId = geometry.id;
          break;
        }

        case HEIGHTFIELD: {
          const geometry = createHeightfieldGeometry(shape);
          mesh = new Mesh(geometry, _material.clone());
          mesh.material.color = new Color('#232323')
          mesh.material.opacity = .5
          shape.geometryId = geometry.id;
          break;
        }
      }
    }



    scene.add(mesh);
    return mesh;
  }

  function scaleMesh(mesh, shape) {
    const {
      SPHERE,
      BOX,
      PLANE,
      CYLINDER,
      CONVEXPOLYHEDRON,
      TRIMESH,
      HEIGHTFIELD
    } = Shape.types;

    switch (shape.type) {
      case SPHERE:
        {
          const {
            radius
          } = shape;
          mesh.scale.set(radius * scale, radius * scale, radius * scale);
          break;
        }

      case BOX:
        {
          mesh.scale.copy(shape.halfExtents);
          mesh.scale.multiplyScalar(2 * scale);
          break;
        }

      case PLANE:
        {
          break;
        }

      case CYLINDER:
        {
          mesh.scale.set(1 * scale, 1 * scale, 1 * scale);
          break;
        }

      case CONVEXPOLYHEDRON:
        {
          mesh.scale.set(1 * scale, 1 * scale, 1 * scale);
          break;
        }

      case TRIMESH:
        {
          mesh.scale.copy(shape.scale).multiplyScalar(scale);
          break;
        }

      case HEIGHTFIELD:
        {
          mesh.scale.set(1 * scale, 1 * scale, 1 * scale);
          break;
        }
    }
  }

  function typeMatch(mesh, shape) {
    if (!mesh) return false;

    if (isConstraint(shape)) {
      return true
    }

    const {
      geometry
    } = mesh;
    return geometry instanceof SphereGeometry && shape.type === Shape.types.SPHERE ||
        geometry instanceof BoxGeometry && shape.type === Shape.types.BOX ||
        geometry instanceof PlaneGeometry && shape.type === Shape.types.PLANE ||
        geometry.id === shape.geometryId && shape.type === Shape.types.CYLINDER ||
        geometry.id === shape.geometryId && shape.type === Shape.types.CONVEXPOLYHEDRON ||
        geometry.id === shape.geometryId && shape.type === Shape.types.TRIMESH ||
        geometry.id === shape.geometryId && shape.type === Shape.types.HEIGHTFIELD;
  }

  function updateMesh(index, shape) {
    let mesh = _meshes[index];
    let didCreateNewMesh = false;

    if (!typeMatch(mesh, shape)) {
      if (mesh) scene.remove(mesh);
      _meshes[index] = mesh = createMesh(shape);
      didCreateNewMesh = true;
    }

    scaleMesh(mesh, shape);
    return didCreateNewMesh;
  }

  function createSpringConstraintMesh(shape) {
    const globalMesh = new Mesh()

    const anchorPointA = new Mesh(new SphereGeometry(0.2, 10, 10), _material.clone())
    anchorPointA.position.copy(shape.bodyA.position).add(shape.localAnchorA)
    anchorPointA.material.color = new Color('#' + Math.floor(Math.random()*16777215).toString(16))
    globalMesh.add(anchorPointA)

    const anchorPointB = new Mesh(new SphereGeometry(0.2), _material.clone())
    anchorPointB.position.copy(shape.bodyB.position).add(shape.localAnchorB)
    anchorPointB.material.color = new Color('#' + Math.floor(Math.random()*16777215).toString(16))
    globalMesh.add(anchorPointB)

    const geometry = new BufferGeometry().setFromPoints(
        [anchorPointA.position, anchorPointB.position]
    );
    const mesh = new Line( geometry, new LineBasicMaterial({color: 0xff0000}) );
    globalMesh.add(mesh)

    return globalMesh;
  }

  function createHingeConstraintMesh(shape) {
    const globalMesh = new Mesh()
    const color = new Color('#' + Math.floor(Math.random()*16777215).toString(16))

    const anchorPointA = new Mesh(new CylinderGeometry(0.1, 0.1, 0.2), _material.clone())
    anchorPointA.position.copy(shape.bodyA.position).add(shape.pivotA)
    anchorPointA.material.color = color
    globalMesh.add(anchorPointA)

    const anchorPointB = new Mesh(new SphereGeometry(0.1), _material.clone())
    anchorPointB.position.copy(shape.bodyB.position).add(shape.pivotB)
    anchorPointB.material.color = color
    globalMesh.add(anchorPointB)

    const geometry = new BufferGeometry().setFromPoints(
        [anchorPointA.position, anchorPointB.position]
    );
    const mesh = new Line( geometry, new LineBasicMaterial({color: color}) );
    globalMesh.add(mesh)

    const axisAGeometry = new BufferGeometry().setFromPoints(
        [anchorPointA.position, anchorPointA.position.clone().add(shape.axisA)]
    );
    const axisAMesh = new Line( axisAGeometry, new LineBasicMaterial({color: color}) );
    globalMesh.add(axisAMesh)

    const axisBGeometry = new BufferGeometry().setFromPoints(
        [anchorPointB.position, anchorPointB.position.clone().add(shape.axisB)]
    );
    const axisBMesh = new Line( axisBGeometry, new LineBasicMaterial({color: color}) );
    globalMesh.add(axisBMesh)

    return globalMesh;
  }

  function createConstraintMesh(shape) {
    console.log(shape)
    const globalMesh = new Mesh()

    const anchorPointA = new Mesh(new SphereGeometry(0.2, 10, 10), _material.clone())
    anchorPointA.position.copy(shape.bodyA.position).add(shape.pivotA)
    anchorPointA.material.color = new Color('#' + Math.floor(Math.random()*16777215).toString(16))
    globalMesh.add(anchorPointA)

    const anchorPointB = new Mesh(new SphereGeometry(0.2), _material.clone())
    anchorPointB.position.copy(shape.bodyB.position).add(shape.pivotB)
    anchorPointB.material.color = new Color('#' + Math.floor(Math.random()*16777215).toString(16))
    globalMesh.add(anchorPointB)

    const geometry = new BufferGeometry().setFromPoints(
        [anchorPointA.position, anchorPointB.position]
    );
    const mesh = new Line( geometry, new LineBasicMaterial({color: 0xff0000}) );
    globalMesh.add(mesh)

    return globalMesh;
  }

  function updateConstraintMesh(shape, mesh) {

    switch (shape.constructor.name) {
      case constraintsTypes.Spring: {
        const anchorPointA = mesh.children[0]
        anchorPointA.position.copy(shape.bodyA.position).add(shape.localAnchorA)
        const anchorPointB = mesh.children[1]
        anchorPointB.position.copy(shape.bodyB.position).add(shape.localAnchorB)
        const line = mesh.children[2]
        line.geometry.attributes.position.array[0] = anchorPointA.position.clone().x
        line.geometry.attributes.position.array[1] = anchorPointA.position.clone().y
        line.geometry.attributes.position.array[2] = anchorPointA.position.clone().z
        line.geometry.attributes.position.array[3] = anchorPointB.position.clone().x
        line.geometry.attributes.position.array[4] = anchorPointB.position.clone().y
        line.geometry.attributes.position.array[5] = anchorPointB.position.clone().z
        line.geometry.attributes.position.needsUpdate = true;
        break;
      }
      case constraintsTypes.HingeConstraint: {
        const anchorPointA = mesh.children[0]
        anchorPointA.position.copy(shape.bodyA.position).add(shape.pivotA)
        const anchorPointB = mesh.children[1]
        anchorPointB.position.copy(shape.bodyB.position).add(shape.pivotB)
        const line = mesh.children[2]
        line.geometry.attributes.position.array[0] = anchorPointA.position.clone().x
        line.geometry.attributes.position.array[1] = anchorPointA.position.clone().y
        line.geometry.attributes.position.array[2] = anchorPointA.position.clone().z
        line.geometry.attributes.position.array[3] = anchorPointB.position.clone().x
        line.geometry.attributes.position.array[4] = anchorPointB.position.clone().y
        line.geometry.attributes.position.array[5] = anchorPointB.position.clone().z
        line.geometry.attributes.position.needsUpdate = true;
        const lineAxisA = mesh.children[3]
        lineAxisA.geometry.attributes.position.array[0] = anchorPointA.position.clone().x
        lineAxisA.geometry.attributes.position.array[1] = anchorPointA.position.clone().y
        lineAxisA.geometry.attributes.position.array[2] = anchorPointA.position.clone().z
        lineAxisA.geometry.attributes.position.array[3] = anchorPointA.position.clone().add(shape.axisA).x
        lineAxisA.geometry.attributes.position.array[4] = anchorPointA.position.clone().add(shape.axisA).y
        lineAxisA.geometry.attributes.position.array[5] = anchorPointA.position.clone().add(shape.axisA).z
        lineAxisA.geometry.attributes.position.needsUpdate = true;
        const lineAxisB = mesh.children[4]
        lineAxisB.geometry.attributes.position.array[0] = anchorPointB.position.clone().x
        lineAxisB.geometry.attributes.position.array[1] = anchorPointB.position.clone().y
        lineAxisB.geometry.attributes.position.array[2] = anchorPointB.position.clone().z
        lineAxisB.geometry.attributes.position.array[3] = anchorPointA.position.clone().add(shape.axisB).x
        lineAxisB.geometry.attributes.position.array[4] = anchorPointA.position.clone().add(shape.axisB).y
        lineAxisB.geometry.attributes.position.array[5] = anchorPointA.position.clone().add(shape.axisB).z
        lineAxisB.geometry.attributes.position.needsUpdate = true;
        break;
      }
      default: {
        const anchorPointA = mesh.children[0]
        anchorPointA.position.copy(shape.bodyA.position).add(shape.pivotA)
        const anchorPointB = mesh.children[1]
        anchorPointB.position.copy(shape.bodyB.position).add(shape.pivotB)
        const line = mesh.children[2]
        line.geometry.attributes.position.array[0] = anchorPointA.position.clone().x
        line.geometry.attributes.position.array[1] = anchorPointA.position.clone().y
        line.geometry.attributes.position.array[2] = anchorPointA.position.clone().z
        line.geometry.attributes.position.array[3] = anchorPointB.position.clone().x
        line.geometry.attributes.position.array[4] = anchorPointB.position.clone().y
        line.geometry.attributes.position.array[5] = anchorPointB.position.clone().z
        line.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  function update() {
    const meshes = _meshes;
    const shapeWorldPosition = _tempVec0;
    const shapeWorldQuaternion = _tempQuat0;
    let meshIndex = 0;

    for (const body of world.bodies) {
      for (let i = 0; i !== body.shapes.length; i++) {
        const shape = body.shapes[i];
        const didCreateNewMesh = updateMesh(meshIndex, shape);
        const mesh = meshes[meshIndex];

        if (mesh) {
          // Get world position
          body.quaternion.vmult(body.shapeOffsets[i], shapeWorldPosition);
          body.position.vadd(shapeWorldPosition, shapeWorldPosition); // Get world quaternion

          body.quaternion.mult(body.shapeOrientations[i], shapeWorldQuaternion); // Copy to meshes

          mesh.position.copy(shapeWorldPosition);
          mesh.quaternion.copy(shapeWorldQuaternion);
          if (didCreateNewMesh && onInit instanceof Function) onInit(body, mesh, shape);
          if (!didCreateNewMesh && onUpdate instanceof Function) onUpdate(body, mesh, shape);
        }

        meshIndex++;
      }
    }

    for (const constraint of [...world.constraints, ...world.springs]) {
        const shape = constraint;
        const didCreateNewMesh = updateMesh(meshIndex, shape);
        const mesh = meshes[meshIndex];

        if (mesh) {
          updateConstraintMesh(shape, mesh)
        }

        meshIndex++;
    }

    for (let i = meshIndex; i < meshes.length; i++) {
      const mesh = meshes[i];
      if (mesh) scene.remove(mesh);
    }

    meshes.length = meshIndex;
  }

  return {
    update
  };
}

export { CannonDebugger as default };
