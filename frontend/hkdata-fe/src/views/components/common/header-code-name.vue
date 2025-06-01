<template>
  <div class="header">
    <span class="google-logo">{{ code }}</span>
    <span class="alphabet">{{ name }}</span>
  </div>
</template>

<script setup>
defineProps({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.header {
  position: relative;
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}
.google-logo {
  font-size: 72px;
  font-weight: bold;
  letter-spacing: 2px;
  font-family: 'Product Sans', 'Arial', sans-serif;
  color: #4285f4;
  background: linear-gradient(90deg, #4285f4 0%, #ea4335 30%, #fbbc05 60%, #34a853 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}
.alphabet {
  position: absolute;
  right: 10px;
  bottom: 0;
  font-size: 36px;
  color: #ea4335;
  font-weight: 500;
  letter-spacing: 1px;
  font-family: 'Arial', sans-serif;
}
</style>
