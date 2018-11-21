
// NO COMMENT

function generate () {
  const output = _makeArr81(() => '')
  const possibilities = _makeArr81(() => Array.from({length: 9}, () => 1))
  const relevances =  _makeArr81((c, i) => _getRelevantCells(i))

  _findCell()

  return make2DimensionsArr(output)

  function _findCell (index = 0) {
    if (index === 81) return

    const vals = []
    possibilities[index].forEach((p, i) => {
      if (p === 1) vals.push(i)
    })
    if (!vals.length) {
      possibilities[index].forEach((p, i) => {
        if (p === 2) possibilities[index][i] = 1
      })
      return -1
    }

    const selected = vals[Math.floor(Math.random() * vals.length)]

    _updateRelevantPossibilities(index, selected, -1)

    if (_findCell(index + 1) === -1) {
      possibilities[index][selected] = 2
      _updateRelevantPossibilities(index, selected, 1)
      return _findCell(index)
    } else {
      output[index] = selected + 1
    }
  }
  function _updateRelevantPossibilities (i, number, change = -1) {
    relevances[i].forEach(cellIndex => {
      possibilities[cellIndex][number] += change
    })
  }
}

function _makeArr81 (func) {
  return Array.from({length: 81}, func)
}

function _getRelevantCells (i) {
  const output = []
  const {x, y} = _indexToCoord(i)
  const NEXT_ROW = y + 1
  const MAX_ROW = y + 3 - y % 3
  const MIN_COL = x - x % 3
  const MAX_COL = x + 3 - x % 3
  for (let curI = i + 1; curI < i + 9 - i % 9; curI++) {
    output.push(curI)
  }
  for (let row = NEXT_ROW; row < MAX_ROW; row++) {
    for (let col = MIN_COL; col < MAX_COL; col++) {
      output.push(_coordToIndex(col, row))
    }
  }
  for (let curI = i % 9 + MAX_ROW * 9; curI < 81; curI += 9) {
    output.push(curI)
  }
  return output
}

function make2DimensionsArr (output) {
  const rows = []
  for (let i = 0; i < 9; i ++) {
    rows.push([])
    for (let j = 0; j < 9; j ++) {
      const index = _coordToIndex(i, j)
      rows[i].push(output[index])
    }
  }
  return rows
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

export default {
  generate
}
