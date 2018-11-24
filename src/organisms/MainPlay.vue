<template>
  <div class="or__play">
    <div class="or__play__block" v-for="(block, b) in answer" :key="`b-${b}`">
      <div
        class="or__play__cell"
        :class="{'or__play__cell--active': active === `${b}-${i}`}"
        v-for="(cell, i) in block"
        :key="i"
        @click="active = `${b}-${i}`"
      >
        <div class="or__play__cell__marked">{{cell}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    blocks: Array,
    answer: Array
  },
  data () {
    return {
      active: -1
    }
  }
}
</script>

<style>
.or__play {
  width: calc(100% - 12px);
  max-width: 400px;
  margin: 0 auto;
  padding: 2px;
  grid-gap: 2px;
  background-color: #777;
}
.or__play__block {
  grid-gap: 1px;
  background-color: #ccc;
}
.or__play, .or__play__block {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  justify-content:space-between;
}
.or__play > *:first-child, .or__play::before, .or__play__block > *:first-child, .or__play__block::before {
  grid-row: 1 / 1;
  grid-column: 1 / 1;
}

.or__play::before, .or__play__block::before {
  content: "";
  width: 0;
  padding-top: 100%;
}
.or__play__cell {
  background: #fff;
  cursor: pointer;
}
.or__play__cell__marked {
  display: flex;
  height: 100%;
  color: #2a2a2a;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  line-height: 24px;
  font-weight: 500;
}
.or__play__cell--active {
  background: #dfeef7;
}
</style>
