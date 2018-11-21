<template>
  <div id="app">
    <button style="margin-left:auto; margin-bottom: 8px;" @click="restart">Restart</button>
    <table>
      <tr v-for="(row, i) in rows" :key="i" :class="{'border': i === 2 || i === 5}">
        <td v-for="(x, j) in row" :key="`x-${j}`" :class="{'border': j === 2 || j === 5}">
          <input v-model="rows[i][j]" @change="rows[i][j] = $event && $event > 0 && $event < 10 ? $event[0] : ''"/>
        </td>
      </tr>
    </table>
    <button @click="solve">SOLVE!</button>
  </div>
</template>

<script>
import sudoku from './sudoku'
export default {
  name: 'app',
  data () {
    return {
      rows: sudoku.generate('hardest'),
      difficulty: 'hardest'
    }
  },
  methods: {
    restart () {
      this.rows = sudoku.generate(this.difficulty)
    },
    solve () {

    }
  }
}
</script>

<style>
body {
  margin: 0;
}
#app {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background: #efefef;
}
table {
  width: 420px;
  height: 420px;
  max-width: 420px;
  background: #fff;
  border-collapse: collapse;
  box-shadow: 0 0 30px 0 rgba(0,0,0,.2);
  border: 2px solid #555;
  box-sizing: border-box;
  margin-bottom: 40px;
}
tr, td {
  box-sizing: border-box;
}
td {
  border: 1px solid #ddd;
  height: 30px;
  width: 30px;
  max-width: 30px;
  max-height: 30px;
  padding: 0;
}
tr.border {
  border-bottom: 2px solid #555;
}
td.border {
  border-right: 2px solid #555;
}
input {
  border: none;
  height: 100%;
  width: 100%;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  transition: .1s;
}
input:focus, button:focus {
  outline: none;
}
input:focus {
  background: #efefef;
}
button {
  height: 40px;
  width: 200px;
  background: #5167d9;
  border: 0;
  font-size: 20px;
  line-height: 30px;
  cursor: pointer;
  color: #fff;
  box-shadow: 3px 3px 20px 0 rgba(0,0,0,.2);
  border-radius: 4px;
  letter-spacing: 2px;
  font-weight: 600;
  font-family: "Comic Sans MS", cursive, sans-serif;
  transition: .4s;
}
button:hover {
  background: #7285e8;
}
button:active {
  transform: translate(0, 6px);
}
</style>
