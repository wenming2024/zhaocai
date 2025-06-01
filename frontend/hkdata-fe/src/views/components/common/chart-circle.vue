<template>
  <div class="circle-container">
    <div
      v-for="item in data"
      :key="item.name"
      class="circle-bubble"
      :class="item.name.toLowerCase()"
      :style="{
        background: item.color,
        width: item.size + 'px',
        height: item.size + 'px',
        fontSize: item.font + 'px'
      }"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item =>
        typeof item.name === 'string' &&
        typeof item.color === 'string' &&
        typeof item.size === 'number' &&
        typeof item.font === 'number'
      )
    }
  }
})
</script>

<style scoped>
.circle-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 180px;
  margin-top: 32px;
}

.circle-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: bold;
  font-size: 22px;
  box-shadow: 0 2px 8px #e0e0e0;
}

.circle-bubble.china { background: #2986f7; width: 90px; height: 90px; font-size: 28px; }
.circle-bubble.middle-east { background: #3b5998; width: 70px; height: 70px; font-size: 22px; }
.circle-bubble.brazil { background: #7b8dbb; width: 54px; height: 54px; font-size: 18px; }
.circle-bubble.other { background: #111; width: 44px; height: 44px; font-size: 16px; }
</style>
