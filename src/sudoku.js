
const ADDRESSES = _makeAddresses()
const BOXES_INDEXES = _makeBoxIndexes()
const AFFTECEDS = _makeArr81((c, i) => _makeAffectedCells(i))
const RELATEDS = _makeArr81((c, i) => _makeRelatedCells(i))
const HOUSES = _makeArr81((c, i) => _makeHouses(i))
// <GENERATOR>
function generate () {
  const answer = _makeArr81(() => '')
  const possibilities = _makeArr81(() => Array.from({length: 9}, () => 1))

  _makeCell()

  return {
    answer,
    trimmedAnswer: _trimAnswer(answer)
  }

  function _makeCell (index = 0) {
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

    const selected = _getRandomElm(vals)

    _updateAffectedPossibilities(index, selected, -1)

    if (_makeCell(index + 1) === -1) {
      possibilities[index][selected] = 2
      _updateAffectedPossibilities(index, selected, 1)
      return _makeCell(index)
    } else {
      answer[index] = selected + 1
    }
  }

  function _updateAffectedPossibilities (i, number, change = -1) {
    AFFTECEDS[i].forEach(cellIndex => {
      possibilities[cellIndex][number] += change
    })
  }
}

function _trimAnswer (initAnswer) {
  const positions = _shuffle(Array.from({length: 81}, (x, i) => i))
  const answer = [...initAnswer]
  _trim()
  function _trim (pos = 0) {
    if (pos === 81) return
    const cellIndex = positions[pos]
    const val = answer.splice(cellIndex, 1, '')[0]
    if (!_hasUniqueSolution(answer)) {
      answer.splice(cellIndex, 1, val)
    }
    _trim(pos + 1)
  }

  return answer
}

function _hasUniqueSolution (initCells) {
  return _findSolutions(_makeRemainingPossibilities([...initCells])) === 1
}

function _findSolutions (possibilities, index = 0, solutionsCount = 0) {
  if (index === 81) return ++solutionsCount

  if (!possibilities[index]) return _findSolutions(possibilities, index + 1, solutionsCount)

  const selected = _getFirstValidPossibility(possibilities[index])
  if (selected > -1) {
    _updateAffectedPossibilities(possibilities, index, selected, -1)
    solutionsCount = _findSolutions(possibilities, index + 1, solutionsCount)
    if (solutionsCount < 2) {
      possibilities[index][selected] = 2
      _updateAffectedPossibilities(possibilities, index, selected, 1)
      return _findSolutions(possibilities, index, solutionsCount)
    }
  } else {
    possibilities[index].forEach((p, i) => {
      if (p === 2) possibilities[index][i] = 1
    })
  }
  return solutionsCount
}

function _updateAffectedPossibilities (possibilities, i, number, change = -1) {
  AFFTECEDS[i].forEach(cellIndex => {
    if (possibilities[cellIndex]) {
      possibilities[cellIndex][number] += change
    }
  })
}

function _getFirstValidPossibility (possibilities) {
  for (let i = 0; i < 9; i++) {
    if (possibilities[i] === 1) {
      return i
    }
  }
}

function _makeRemainingPossibilities (cells) {
  const validCounts = []
  const output = []
  for (let cellIndex = 0; cellIndex < 81; cellIndex++) {
    if (cells[cellIndex]) {
      output[cellIndex] = null
      continue
    }
    validCounts[cellIndex] = 9
    output[cellIndex] = Array.from({length: 9}, () => 1)
    for (let relateIndex of RELATEDS[cellIndex]) {
      const val = cells[relateIndex]
      if (val && output[cellIndex][val - 1]) {
        output[cellIndex][val - 1] = 0
        if (--validCounts[cellIndex] === 1) {
          cells[cellIndex] = output[cellIndex].findIndex(Boolean) + 1
          output[cellIndex] = null
          _updateNakedSingle(output, cells, cellIndex, validCounts)
          break
        }
      }
    }
  }
  return output
}

function _updateNakedSingle (possibilities, cells, cellIndex, validCounts) {
  const i = cells[cellIndex] - 1
  for (let relateIndex of RELATEDS[cellIndex]) {
    if (!possibilities[relateIndex] || !possibilities[relateIndex][i]) continue
    possibilities[relateIndex][i] = 0
    if (--validCounts[relateIndex] === 1) {
      cells[relateIndex] = possibilities[relateIndex].findIndex(Boolean) + 1
      possibilities[relateIndex] = null
      _updateNakedSingle(possibilities, cells, relateIndex, validCounts)
    }
  }
}
// </GENERATOR>

// <FACTORY>
function _makeAddresses () {
  return Array.from({length: 81}, (cell, i) => _indexToCoord(i))
}
function _makeBoxIndexes () {
  return Array.from({length: 9}, (c, i) => {
    const start = i % 3 * 3 + Math.floor(i / 3) * 27
    return Array.from({length: 9}, (c, j) => {
      const n = j % 3 + (Math.floor(j / 3)) * 9
      return start + n
    })
  })
}
function _makeArr81 (func) {
  return Array.from({length: 81}, func)
}
function _makeAffectedCells (i) {
  const output = []
  const {col, row} = _indexToCoord(i)
  const NEXT_ROW = row + 1
  const MAX_ROW = row + 3 - row % 3
  const MIN_COL = col - col % 3
  const MAX_COL = col + 3 - col % 3
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
function _makeRelatedCells (i) {
  const houses = _makeHouses(i)
  return Array.from(new Set(Array.prototype.concat.apply([], houses)))
}
function _makeHouses (i) {
  // [row, col, box]
  const output = [[], [], []]
  const {col, row, box} = _indexToCoord(i)
  for (let curI = row * 9; curI < i + 9 - col; curI++) {
    output[0].push(curI)
  }
  for (let curI = col; curI < 81; curI += 9) {
    output[1].push(curI)
  }
  BOXES_INDEXES[box].forEach(curI => output[2].push(curI))
  return output
}
// </FACTORY>

// <UTILS>
function _shuffle (arr) {
  const src = [...arr]
  const len = arr.length
  const output = []
  for (let i = 0; i < len; i++) {
    output.push(_spliceRandomElm(src))
  }
  return output
}
function _indexToCoord (i) {
  const col = i % 9
  const row = Math.floor(i / 9)
  return {
    col,
    row,
    box: Math.floor(row / 3) * 3 + Math.floor(col / 3)
  }
}
function _coordToIndex (x, y) {
  return y * 9 + x
}
function _spliceRandomElm (arr) {
  return arr.splice(_getRandomIndex(arr), 1)[0]
}
function _getRandomElm (arr = []) {
  return arr[_getRandomIndex(arr)]
}
function _getRandomIndex (arr = []) {
  return Math.floor(Math.random() * arr.length)
}
// </UTILS>

export default {
  generate,
  addresses: ADDRESSES
}
