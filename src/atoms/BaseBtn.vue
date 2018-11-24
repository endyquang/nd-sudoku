<template>
  <button class="base__btn" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<script>
export default {

}
</script>

<style>
.base__btn {
  height: 32px;
  background: transparent;
  padding: 0;
  border: 0;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  font-weight: 500;
  transition: .4s;
}
.base__btn:hover {
  color: #333;
}
.base__btn:active {
  transform: translate(0, 3px);
}
.base__btn:focus {
  outline: none;
}
</style>
