<template>
  <div id="app">
    <header class="header">
      <button @click="clear">S</button>
      <button @click="clear">P</button>
      <div class="logo">
        <span>NDQ</span>
      </div>
      <button @click="clear">C</button>
      <button @click="restart">R</button>
    </header>
    <main class="main">
      <table>
        <tr v-for="(row, i) in rows" :key="i" :class="{'border': i === 2 || i === 5}">
          <td v-for="(x, j) in row" :key="`x-${j}`" :class="{'border': j === 2 || j === 5}">
            {{rows[i][j]}}
          </td>
        </tr>
      </table>
    </main>
    <footer class="footer">

    </footer>
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
    clear () {

    }
  }
}
</script>

<style>
body {
  margin: 0;
}
div, .main, .header, table, tr, td {
  box-sizing: border-box;
}
#app {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: #efefef;
  user-select: none;
  display: flex;
  flex-direction: column;
  font-family:Verdana, Geneva, Tahoma, sans-serif;
}
.header {
  margin-bottom: 30px;
  display: flex;
  justify-content: flex-end;
}
.logo {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  line-height: 20px;
  color: #888;
  letter-spacing: 1px;
}
.logo span {
  background: #eee;
  border: 2px solid #ccc;
  border-radius: 4px;
  padding: 4px 10px;
}
.header button {
  margin-left: 8px;
  margin-right: 8px;
}
.footer {
  flex-grow: 1;
  margin-top: 30px;
}
.footer, .header {
  box-shadow: 0 0 10px -1px rgba(0,0,0,.2);
  min-height: 60px;
  background: #f8f8f8;
  padding: 10px 16px;
}
.main {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
}
table {
  width: 320px;
  height: 320px;
  max-width: 320px;
  background: #f8f8f8;
  border-collapse: collapse;
  box-shadow: 0 0 10px 0 rgba(0,0,0,.1);
  border: 2px solid #666;
  box-sizing: border-box;
}
tr, td {
  box-sizing: border-box;
}
td {
  border: 1px solid #ddd;
  padding: 0;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  color: #444;
}
tr.border {
  border-bottom: 2px solid #666;
}
td.border {
  border-right: 2px solid #666;
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
  width: 40px;
  background: transparent;
  border: 0;
  font-size: 22px;
  line-height: 40px;
  cursor: pointer;
  color: #666;
  border-radius: 4px;
  font-weight: 500;
  transition: .4s;
}
button:hover {
  color: #333;
}
button:active {
  transform: translate(0, 3px);
}
</style>
