
const ADDRESSES = _makeAddresses()
const BLOCK_POSS = _makeBlockPoss([2,3,4])
const BLOCKS_INDEXES = _makeBlockIndexes()
const AFFTECEDS = _makeArr81((c, i) => _makeAffectedCells(i))
const CORRECTS_QUANTITY = {
  hardest: 26,
  easy: 41
}

function generate (difficulty) {
  const answer = _makeArr81(() => '')
  const possibilities = _makeArr81(() => Array.from({length: 9}, () => 1))

  _findCell()

  return {
    answer,
    trimmedAnswer: _trimAnswer(answer, difficulty)
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
      answer[index] = selected + 1
    }
  }

  function _updateAffectedPossibilities (i, number, change = -1) {
    AFFTECEDS[i].forEach(cellIndex => {
      possibilities[cellIndex][number] += change
    })
  }
}

function _trimAnswer (answer, difficulty) {
  const output = _makeArr81(() => '')
  const {cellsRules, rules} = _makeRules(answer)
  const remainedCellsByBlock = Array.from({length: 9}, () => [])
  const blockDistributions = _distributeToBlocks(CORRECTS_QUANTITY[difficulty])
  const blocksPossibilities = blockDistributions.map(_makeBlockPossibilities)

  _trimBlock()

  remainedCellsByBlock.forEach(block => block.forEach(cell => {
    output[cell] = answer[cell]
  }))

  function _trimBlock (blockIndex = 0) {
    const randomPoss = BLOCK_POSS[blockDistributions[blockIndex]][_spliceRandomElm(blocksPossibilities[blockIndex])]
    if (!randomPoss) {
      return -1
    }
    const selectedCells = randomPoss
      .map(cell => BLOCKS_INDEXES[blockIndex][cell])
    const leftovers = BLOCKS_INDEXES[blockIndex]
      .filter(cell => !selectedCells.includes(cell))
    if (leftovers.find(cell => cellsRules[cell].find(rule => rules[rule] === 1))) {
      return _trimBlock(blockIndex)
    }
    leftovers.forEach(cell => cellsRules[cell].forEach(rule => rules[rule]--))
    remainedCellsByBlock[blockIndex] = selectedCells
    if (blockIndex < 8 && _trimBlock(blockIndex + 1) === -1 && blockIndex > 0) {
      blocksPossibilities[blockIndex + 1] = _makeBlockPossibilities(blockDistributions[blockIndex])
      remainedCellsByBlock[blockIndex + 1] = []
      remainedCellsByBlock[blockIndex] = []
      leftovers.forEach(cell => cellsRules[cell].forEach(rule => rules[rule]++))
      return _trimBlock(blockIndex)
    }
  }

  function _makeBlockPossibilities (dis) {
    return Array.from({length: BLOCK_POSS[dis].length}, (x, i) => i)
  }

  return output
}

// Kind of rules that say there must be at least 1 in a group of cells
function _makeRules (answer) {
  // rules for each cells, stored by rule index in rules arr below
  const {cellsRules, rules} = _makeDefaultRules()

  _makeTriangles(answer, (triangle) => {
    triangle.forEach(tip => {
      cellsRules[tip].push(rules.length)
    })
    rules.push(4)
  })

  return {cellsRules, rules}
}

function _makeTriangles (answer, callback) {
  const numbersIndexes = Array.from({length: 9}, () => [])
  answer.forEach((cell, i) => {
    numbersIndexes[cell - 1].push(i)
  })
  numbersIndexes.forEach(numberIndexes => {
    for (let i = 0; i < 9; i++) {
      const tip1 = numberIndexes[i]
      for (let j = i + 1; j < 9; j++) {
        _findOtherTips(tip1, numberIndexes[j], (tip2, tip4) => {
          if (answer[tip2] === answer[tip4]) {
            callback([tip1, tip2, numberIndexes[j], tip4])
          }
        })
      }
    }
  })
}

function _findOtherTips (tip1, tip3, callback) {
  const tip1Coord = _indexToCoord(tip1)
  const tip3Coord = _indexToCoord(tip3)
  const tip2 = _coordToIndex(tip1Coord.x, tip3Coord.y)
  const tip4 = _coordToIndex(tip3Coord.x, tip1Coord.y)
  callback(tip2, tip4)
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

// <FACTORY>
function _makeAddresses () {
  return Array.from({length: 81}, (cell, i) => {
    const {x: col, y: row} = _indexToCoord(i)
    const block = _coordToBlock(col, row)
    return {row, col, block}
  })
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
function _makeArr81 (func) {
  return Array.from({length: 81}, func)
}
function _makeAffectedCells (i) {
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
function _makeDefaultRules () {
  // rules for all rows and cols to have at least 1 cell each
  const cellsRules = Array.from({length: 81}, () => [])
  const rules = []

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      cellsRules[9 * i + j].push(rules.length) // {x: j, y: i}
      cellsRules[9 * j + i].push(rules.length + 1) // {x: i, y: j}
    }
    rules.push(9, 9)
  }

  return {cellsRules, rules}
}
function _makeBlockPoss (distributions) {
  const output = {}
  for (let k of new Set(distributions)) {
    output[k] = _makePossByK(k)
  }
  function _makePossByK (k, alls = [], cur = []) {
    if (k === 0) return alls.push(cur)
    const start = (cur.slice(-1)[0] + 1) || 0
    for (let i = start; i < 9; i++) {
      _makePossByK(k - 1, alls, cur.concat(i))
    }
    return alls
  }
  return output
}
// </FACTORY>

// <UTILS>
function _shuffle (arr) {
  const src = [...arr]
  const output = []
  for (let i = 0; i < 9; i++) {
    output.push(_spliceRandomElm(src))
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
function _coordToBlock (x, y) {
  const i = Math.floor(x / 3)
  const j = Math.floor(y / 3)
  return j * 3 + i
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
// function _getFractional (n) {
//   return n > 1 ? n * _getFractional(n - 1) : n
// }
// </UTILS>

export default {
  generate,
  addresses: ADDRESSES
}
