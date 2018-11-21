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
export default {
  name: 'app',
  data () {
    return {
      rows: this.generateEmptyRows('')
    }
  },
  methods: {
    restart () {
      const output = Array.from({length: 81}, () => '')
      const possibilities = Array.from({length: 81}, () => Array.from({length: 9}, () => 1))
      const relevances = Array.from({length: 81}, (c, i) => _getRelevantCells(i))
      _findCell()
      // console.log(relevances, possibilities)
      const rows = this.generateEmptyRows('')
      output.forEach((cell, i) => {
        const {x, y} = _indexToCoord(i)
        rows[x][y] = cell
      })
      this.rows = rows
      function _findCell (index = 0) {
        if (index === 81) return
        // console.log('-- ' + (index > 9 ? '' : '0') + index + ' --')
        const vals = []
        possibilities[index].forEach((p, i) => {
          if (p > 0) vals.push(i)
        })
        // console.log(vals)
        if (!vals.length) return - 1
        const selected = vals[Math.floor(Math.random() * vals.length)]
        // console.log(selected + 1)
        output[index] = selected + 1
        _updateRelevantPossibilities(index, selected, -1)
        if (_findCell(index + 1) === -1) {
          possibilities[index][selected]--
          output[index] = ''
          _updateRelevantPossibilities(index, selected, 1)
          return _findCell(index)
        }
      }
      function _updateRelevantPossibilities (i, number, change = -1) {
        relevances[i].forEach(cellIndex => {
          possibilities[cellIndex][number] += change
        })
      }
      function _getRelevantCells (i) {
        const output = []
        const {x, y} = _indexToCoord(i)
        const NEXT_ROW = y + 1
        const MAX_ROW = y + 3 - y % 3
        const MIN_COL = x - x % 3
        const MAX_COL = x + 3 - x % 3
        for (let row = NEXT_ROW; row < MAX_ROW; row++) {
          for (let col = MIN_COL; col < MAX_COL; col++) {
            output.push(_coordToIndex(col, row))
          }
        }
        for (let curI = i + 1; curI < i + 9 - i % 9; curI++) {
          output.push(curI)
        }
        for (let curI = i + MAX_ROW * 9; curI < 81; curI += 9) {
          output.push(curI)
        }
        return output
      }
      function _indexToCoord (i) {
        return {
          x: i % 9,
          y: Math.floor(i / 9)
        }
      }
      function _coordToIndex (x, y) {
        return y * 9 + x
      }
    },
    generateEmptyRows (defVal) {
      const rows = []
      for (let i = 0; i < 9; i ++) {
        rows.push([])
        for (let j = 0; j < 9; j ++) {
          rows[i].push(typeof defVal === 'function' ? defVal() : defVal)
        }
      }
      return rows
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
