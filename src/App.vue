<template>
  <div id="app" @touchmove="$event.preventDefault()">
    <div class="pending" v-if="pending">
      <div class="pending__logo">
        NUDOKU
      </div>
      <template v-if="won">
        <div class="pending__noti" v-if="won">YOU'VE LUCKYLY WON!</div>
      </template>
      <div class="pending__noti" v-else-if="lost">YOU DUMBASS LOSER!</div>
      <div class="pending__subtitle" v-else>Just a dummy text to make it look not as empty as its creator</div>
      <div class="pending__score"></div>
      <button @click="start" class="pending__start">PLAY {{won || lost ? 'AGAIN' : 'NOW'}}</button>
    </div>
    <header class="header">
      <span>Mistakes: {{mistakes}}/3</span>
      <button @click="togglePaused">
        {{time | prettifyTime}} <i class="header__btn__icon" :class="[paused ? 'ico__pause' : 'ico__play']" />
      </button>
      <button @click="start">New Game</button>
    </header>
    <main class="main">
      <div class="paused" v-if="paused">
        <div class="paused__content">
          <button @click="togglePaused"><i class="ico__play ico--xl" /></button>
        </div>
      </div>
      <div class="play" :class="{'play--paused': paused, 'play--noting': noting}">
        <div class="play__box" v-for="(box, b) in boxes" :key="`b-${b}`" @touchmove="onTouchMove">
          <template v-for="cell in box">
            <div class="play__cell" v-if="paused" :key="cell.id" />
            <div
              v-else
              class="play__cell"
              :class="[
                actives[cell.id]
                  ? 'selected'
                  : active === cell
                    ? 'active'
                    : !multiple && (b === active.box || cell.row === active.row || cell.col === active.col)
                      ? 'affected'
                      : temps[active.id] && temps[active.id] === temps[cell.id]
                        ? 'same'
                        : ''
              ]"
              :key="cell.id"
              :data-id="cell.addr"
              ref="cells"
              @click="!touchable && onActiveChange(cell, $event)"
              @touchstart="onActiveChange(cell, $event)"
            >
              <div
                v-if="cell.value"
                :data-id="cell.addr"
                class="play__cell__fixed"
              >{{cell.value}}</div>
              <div :data-id="cell.addr" class="play__cell__notes" v-else-if="notesState[cell.id]">
                <div :data-id="cell.addr" class="play__cell__notes__item" v-for="(note, n) in notes[cell.id]" :key="n">
                  {{note > 0 ? note : ''}}
                </div>
              </div>
              <div
                v-else-if="temps[cell.id]"
                :data-id="cell.addr"
                class="play__cell__temp"
                :class="{wrong: temps[cell.id] !== answer[cell.id]}"
              >
                {{temps[cell.id]}}
              </div>
              <!-- <div v-else>{{cell}}, {{b}}</div> -->
            </div>
          </template>
        </div>
      </div>

      <div class="controls">
        <button @click="toggleNoting" :class="{'primary': noting}"><div>&#9998;</div> Note</button>
        <button @click="undo"><div>&#x21BA;</div> Undo</button>
        <button @click="erase"><div>&#10008;</div> Erase</button>
        <button @click="toggleMultiple" :class="{'primary': multiple}"><div>&#9783;</div> Multiple</button>
      </div>

      <div class="number">
        <div
          v-for="n in 9"
          :key="n"
          @click="newTemp(n)"
          class="numbers__item"
          :class="{disabled: filledNumbers[n - 1] === 9, primary: noting}"
        >{{n}}</div>
      </div>
    </main>
  </div>
</template>

<script>
import SUDOKU from './sudoku'

function _getHms (seconds = 0) {
  const secsPerHr = 60 * 60
  const secsPerMin = 60
  const hrs = Math.floor(seconds / secsPerHr)
  const mins = Math.floor((seconds - hrs * secsPerHr) / secsPerMin)
  const secs = Math.floor(seconds - hrs * secsPerHr - mins * secsPerMin)
  return [hrs, mins, secs]
}

function _initData (getKey = false) {
  const initData = {
    active: -1,
    actives: [],
    answer: [],
    boxes: [],
    corrects: 0,
    difficulty: 'hardest',
    histories: [],
    lost: false,
    mistakes: 0,
    multiple: false,
    notes: [],
    noting: false,
    paused: false,
    pending: true,
    tempHistory: {},
    temps: [],
    time: 0,
    timer: null,
    won: false
  }

  if (getKey) return Object.keys(initData)

  for (let key in initData) {
    const lastVal = localStorage[key]
    if (lastVal !== undefined && lastVal !== 'undefined') {
      initData[key] = JSON.parse(lastVal || 'null')
    }
  }
  return initData
}

function _makeWatcher () {
  const output = {}
  const keys = _initData(true)
  keys.forEach(key => {
    output[key] = {
      deep: true,
      handler (v) {
        localStorage[key] = JSON.stringify(v)
      }
    }
  })
  return output
}

export default {
  name: 'app',
  data () {
    return _initData()
  },
  watch: _makeWatcher(),
  mounted () {
    this.startTimer()
  },
  computed: {
    notesState () {
      return this.notes.map(note => {
        for (let n of note) {
          if (n > 0) return true
        }
      })
    },
    filledNumbers () {
      const filleds = Array.from({length: 9}, () => 0)
      this.temps.forEach((a, i) => {
        if (a > 0) filleds[a - 1]++
      })
      return filleds
    },
    touchable () {
      return 'ontouchstart' in document.documentElement
    }
  },
  methods: {
    start () {
      this.stopTimer()
      const {answer, trimmedAnswer} = SUDOKU.generate('hardest')
      this.active = -1
      this.actives = Array.from({length: 81}, () => false)
      this.answer = answer
      this.boxes = this.makeBoxes(trimmedAnswer)
      this.corrects = trimmedAnswer.filter(Boolean).length
      this.histories = []
      this.mistakes = 0
      this.multiple = false
      this.notes = Array.from({length: 81}, () => Array.from({length: 9}, () => 0))
      this.paused = false
      this.pending = false
      this.time = 0
      this.timer = null
      this.tempHistory = {notes: [], temps: []}
      this.temps = trimmedAnswer
      this.startTimer()
    },
    makeBoxes (answer) {
      const boxes = Array.from({length: 9}, () => [])
      answer.forEach((value, id) => {
        const {row, col, box} = SUDOKU.addresses[id]
        boxes[box].push({value, id, row, col, box, addr: box + '-' + boxes[box].length})
      })
      return boxes
    },
    startTimer () {
      if (this.pending || this.paused) return
      this.timer = setInterval(() => this.time++, 1000)
    },
    stopTimer () {
      clearInterval(this.timer)
    },
    pushHistory () {
      // UNDO MAXIMUM 50 TIMES
      if (!this.tempHistory.notes.length && !this.tempHistory.temps.length) return
      this.histories.push(this.tempHistory)
      if (this.histories.length > 50) this.histories.splice(0, 1)
      this.tempHistory = {notes: [], temps: []}
    },
    newTemp (value) {
      this.getActiveIndexes(i => {
        if (this.noting) {
          const numberIndex = value - 1
          const oldVal = this.notes[i][numberIndex]
          this.tempHistory.notes.push({cellIndex: i, numberIndex, value: oldVal})
          this.notes[i].splice(numberIndex, 1, oldVal > 0 ? 0 : value)
          return this.resetTemp(i)
        }

        this.resetNote(i)
        if (this.temps[i] === value) {
          this.resetTemp(i)
        } else {
          this.tempHistory.temps.push({cellIndex: i, value: this.temps[i]})
          this.temps.splice(i, 1, value)
          this.clearRelevantNotes(i, value)
          if (value === this.answer[i]) {
            if (++this.corrects === 81) this.win()
          } else if (++this.mistakes === 3) {
            this.gameOver()
          }
        }
      })
      this.pushHistory()
    },
    clearRelevantNotes (cellId, number) {
      const {row, col, box} = SUDOKU.addresses[cellId]
      this.boxes[box].forEach(cell => this.removeNoteItem(cell.id, number))
      this.notes.forEach((note, i) => {
        if (row === SUDOKU.addresses[i].row || col === SUDOKU.addresses[i].col) {
          this.removeNoteItem(i, number)
        }
      })
    },
    erase () {
      this.getActiveIndexes(i => {
        this.resetNote(i)
        this.resetTemp(i)
      })
      this.pushHistory()
    },
    undo () {
      if (this.paused) return
      const {notes = [], temps = []} = this.histories.pop() || {}
      notes.forEach(({cellIndex, numberIndex, value}) => {
        if (numberIndex > -1) {
          this.notes[cellIndex].splice(numberIndex, 1, value)
        } else {
          this.notes.splice(cellIndex, 1, value)
        }
      })
      temps.forEach(({cellIndex, value}) => {
        this.temps.splice(cellIndex, 1, value)
      })
    },
    resetNote (i) {
      if (this.notesState[i]) {
        this.tempHistory.notes.push({cellIndex: i, value: this.notes[i]})
        this.notes.splice(i, 1, Array.from({length: 9}, () => 0))
      }
    },
    removeNoteItem (i, number) {
      if (this.notesState[i]) {
        const numberIndex = number - 1
        this.tempHistory.notes.push({cellIndex: i, numberIndex, value: this.notes[i][numberIndex]})
        this.notes[i].splice(numberIndex, 1, 0)
      }
    },
    resetTemp (i) {
      const value = this.temps[i]
      if (value) {
        if (value === this.answer[i]) this.corrects--
        this.tempHistory.temps.push({cellIndex: i, value})
        this.temps.splice(i, 1, '')
      }
    },
    getActiveIndexes (callback) {
      if (this.paused) return
      if (this.multiple) {
        this.actives.forEach((active, i) => {
          if (active) callback(i)
        })
      } else if (this.active.id >= 0 && !this.active.value) {
        return callback(this.active.id)
      }
    },
    toggleNoting () {
      this.noting = !this.noting
      if (!this.noting) {
        this.multiple = false
        this.actives = Array.from({length: 81}, () => false)
      }
    },
    toggleMultiple () {
      this.multiple = !this.multiple
      this.noting = this.multiple
      if (!this.multiple) {
        this.actives = Array.from({length: 81}, () => false)
      } else if (this.active.id >= 0 && !this.active.value && !this.temps[this.active.id]) {
        this.actives.splice(this.active.id, 1, true)
        this.active = -1
      }
    },
    onActiveChange (cell, e) {
      if (!cell || cell === this.active) return
      if (this.multiple && !cell.value && !this.temps[cell.id]) {
        this.actives.splice(cell.id, 1, !this.actives[cell.id])
      } else {
        this.active = cell
      }
    },
    gameOver () {
      this.lost = true
      this.openPendingWindow()
    },
    win () {
      this.won = true
      this.openPendingWindow()
    },
    openPendingWindow () {
      this.pending = true
      this.stopTimer()
    },
    togglePaused () {
      this.paused = !this.paused
      if (this.paused) this.stopTimer()
      else this.startTimer()
    },
    onTouchMove (e) {
      if (this.multiple) return
      const {clientX, clientY} = e.touches[0]
      const el = document.elementFromPoint(clientX, clientY)
      if (!el) return
      const id = el.getAttribute('data-id')
      if (!id) return
      const [box, i] = id.split('-')
      this.onActiveChange(this.boxes[box][i])
    }
  },
  filters: {
    prettifyTime (seconds = 0) {
      if (!(seconds > -1)) return '00:00'
      const to2Letters = n => ('0' + n).slice(-2)
      const [hrs, mins, secs] = _getHms(seconds)
      return (hrs ? `${to2Letters(hrs)}:` : '') + `${to2Letters(mins)}:${to2Letters(secs)}`
    }
  }
}
</script>
