<script async setup>
import { useLoader } from '@tresjs/core'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'

const { scene } = await useLoader(GLTFLoader, '/assets/models/logo_petitglacon.glb')

</script>


<template>
    <primitive :object="scene" />
</template>