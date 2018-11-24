
// NO COMMENT

const BLOCKS_INDEXES = _makeBlockIndexes()
const AFFTECEDS = _makeArr81((c, i) => _getAffectedCells(i))
const CORRECTS_QUANTITY = {
  hardest: 26,
  easy: 41
}

function generate (difficulty) {
  const output = _makeArr81(() => '')
  const possibilities = _makeArr81(() => Array.from({length: 9}, () => 1))

  _findCell()
  const answer = [...output]
  const trimmedAnswer = _trimOutput(output, difficulty)

  return {
    answer,
    trimmedAnswer,
    blocks: _makeBlocks(trimmedAnswer),
    corrects: CORRECTS_QUANTITY[difficulty]
  }

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

    const selected = _getRandomElm(vals)

    _updateAffectedPossibilities(index, selected, -1)

    if (_findCell(index + 1) === -1) {
      possibilities[index][selected] = 2
      _updateAffectedPossibilities(index, selected, 1)
      return _findCell(index)
    } else {
      output[index] = selected + 1
    }
  }
  function _updateAffectedPossibilities (i, number, change = -1) {
    AFFTECEDS[i].forEach(cellIndex => {
      possibilities[cellIndex][number] += change
    })
  }
}

function _makeArr81 (func) {
  return Array.from({length: 81}, func)
}

function _getAffectedCells (i) {
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

function _indexToCoord (i) {
  return {
    x: i % 9,
    y: Math.floor(i / 9)
  }
}
function _coordToIndex (x, y) {
  return y * 9 + x
}

function _trimOutput (output, difficulty) {
  const n = CORRECTS_QUANTITY[difficulty]
  const blockDistributions = _distributeToBlocks(n)
  blockDistributions.forEach((total, blockNo) => {
    const cells = BLOCKS_INDEXES[blockNo].slice()
    for (let i = 0; i < 9 - total; i++) {
      output[_spliceRandomElm(cells)] = ''
    }
  })
  return output
}

function _distributeToBlocks (n) {
  const cases = {
    26: [
      [4, 4, 4, 4, 2, 2, 2, 2, 2],
      [3, 3, 4, 4, 4, 2, 2, 2, 2],
      [3, 3, 3, 3, 4, 4, 2, 2, 2],
      [3, 3, 3, 3, 3, 3, 4, 2, 2],
      [3, 3, 3, 3, 3, 3, 3, 3, 2]
    ]
  }[n]
  return _shuffle(_getRandomElm(cases))
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

function _shuffle (arr) {
  const src = [...arr]
  const output = []
  for (let i = 0; i < 9; i++) {
    output.push(_spliceRandomElm(src))
  }
  return output
}

function _makeBlockIndexes () {
  return Array.from({length: 9}, (c, i) => {
    const start = i % 3 * 3 + Math.floor(i / 3) * 27
    return Array.from({length: 9}, (c, j) => {
      const n = j % 3 + (Math.floor(j / 3)) * 9
      return start + n
    })
  })
}

function _makeBlocks (output) {
  const blocks = []
  BLOCKS_INDEXES.forEach((blockIndexes, i) => {
    blocks.push([])
    blockIndexes.forEach(cellIndex => {
      const {x, y} = _indexToCoord(cellIndex)
      blocks[i].push({
        id: cellIndex,
        value: output[cellIndex],
        row: y,
        col: x,
        block: i
      })
    })
  })
  return blocks
}

export default {
  generate
}
