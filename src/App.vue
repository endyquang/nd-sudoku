<template>
  <div id="app" @touchmove="$event.preventDefault()">
    <div class="pending" v-if="pending">
      <div class="pending__logo">
        NUDOKU
      </div>
      <template v-if="won">
        <div class="pending__noti" v-if="won">YOU'VE LUCKILY WON!</div>
      </template>
      <div class="pending__noti" v-else-if="lost">YOU DUMBASS LOSER!</div>
      <div class="pending__subtitle" v-else>Just a dummy text to make it look not as empty as its creator</div>
      <div class="pending__score" v-if="won || lost">
        <div class="pending__score__title">HIGH SCORES</div>
        <div v-for="(score, i) in highScores" :key="i" class="pending__score__item">
          <span>{{score.completedAt}}</span>
          <span>{{score.time | prettifyTime(false)}}</span>
        </div>
      </div>
      <div v-else />
      <button @click="start" class="pending__start">PLAY {{won || lost ? 'AGAIN' : 'NOW'}}</button>
    </div>
    <header id="header" class="header">
      <span>Mistakes: {{mistakes}}/3</span>
      <button @click="togglePaused">
        {{time | prettifyTime}} <i class="header__btn__icon" :class="[paused ? 'ico__pause' : 'ico__play']" />
      </button>
      <div style="display: flex;">
        <button @click="toggleMute" class="mute-btn">
          <i :class="[mute ? 'ico__mute' : 'ico__unmute']" />
        </button>
        <button @click="start">New Game</button>
      </div>
    </header>
    <main class="main">
      <div id="play" class="play" :class="{'play--paused': paused, 'play--noting': noting}">
        <div class="play__box" v-for="(box, b) in boxes" :key="`b-${b}`" @touchmove="onTouchMove">
          <template v-for="cell in box">
            <div class="play__cell" v-if="paused" :key="cell.id" />
            <div
              v-else
              class="play__cell"
              :class="[
                actives[cell.id]
                  ? 'selected'
                  : active && active.id === cell.id
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
                <div :data-id="cell.addr" class="play__cell__notes__item" :class="{'same': note > 0 && n + 1 === temps[active.id]}" v-for="(note, n) in notes[cell.id]" :key="n">
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
            </div>
          </template>
        </div>
        <div class="paused" v-if="paused">
          <div class="paused__content">
            <button @click="togglePaused"><i class="ico__play ico--xl" /></button>
          </div>
        </div>
      </div>

      <div id="controls" class="controls">
        <button @click="toggleNoting" :class="{'primary': noting}"><div>&#9998;</div> Note</button>
        <button @click="undo"><div>&#x21BA;</div> Undo</button>
        <button @click="erase"><div>&#10008;</div> Erase</button>
        <button @click="toggleMultiple" :class="{'primary': multiple}"><div>&#9783;</div> Multiple</button>
      </div>

      <div id="number" class="number">
        <div
          v-for="n in 9"
          :key="n"
          @click="onNumberClick(n)"
          class="numbers__item"
          :class="{disabled: filledNumbers[n - 1] === 9, primary: noting}"
        >{{n}}</div>
      </div>
    </main>
    <footer id="footer" class="footer">
      <a href="https://github.com/endyquang/nudoku" target="_blank">
        <img :src="`${publicPath}img/github.png`" />
      </a>
    </footer>
  </div>
</template>

<script>
import SUDOKU from './sudoku'
import utils from './utils'

const publicPath = process.env.BASE_URL

function _makeSound (src) {
  return new Audio(publicPath + src)
}

const sounds = {
  temp: _makeSound('sfx/temp.mp3'),
  tap: _makeSound('sfx/tap.mp3'),
  note: _makeSound('sfx/note.mp3'),
  tool: _makeSound('sfx/tool.mp3'),
  play: _makeSound('sfx/play.mp3')
}

function _initData (getKey = false) {
  const initData = {
    active: -1,
    actives: [],
    answer: [],
    boxes: [],
    corrects: 0,
    difficulty: 'hardest',
    highScores: [],
    histories: [],
    lost: false,
    mistakes: 0,
    mute: false,
    multiple: false,
    notes: [],
    noting: false,
    paused: false,
    pending: true,
    publicPath: process.env.BASE_URL,
    tempHistory: [],
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
    const ids = ['header', 'play', 'controls', 'number', 'footer']
    const els = {}
    const heights = {}
    ids.forEach(id => {
      const el = document.querySelector('#' + id) || null
      if (!el) return
      els[id] = el
      heights[id] = el.offsetHeight
    })
    function _updateDisplay () {
      let temp = 0
      const innerHeight =  Math[window.innerWidth > 768 ? 'min' : 'max'](window.innerHeight, window.innerWidth)
      for (let key in els) {
        temp += heights[key]
        if (temp > innerHeight) {
          els[key].style.display = 'none'
        } else {
          els[key].style = {}
        }
      }
    }
    _updateDisplay()
    window.onresize = _updateDisplay
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
      this.playSound('play')
      this.stopTimer()
      const {answer, trimmedAnswer} = SUDOKU.generate('hardest')
      this.active = -1
      this.resetActives()
      this.answer = answer
      this.boxes = this.makeBoxes(trimmedAnswer)
      this.corrects = trimmedAnswer.filter(Boolean).length
      this.histories = []
      this.lost = false
      this.mistakes = 0
      this.multiple = false
      this.notes = Array.from({length: 81}, () => Array.from({length: 9}, () => 0))
      this.paused = false
      this.pending = false
      this.won = false
      this.time = 0
      this.timer = null
      this.tempHistory = []
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
      if (!this.tempHistory.length) return
      this.histories.push(this.tempHistory)
      if (this.histories.length > 50) this.histories.splice(0, 1)
      this.tempHistory = []
    },
    onNumberClick (value) {
      this.getActiveIndexes(i => {
        if (this.noting) {
          this.playSound('note')
          const numberIndex = value - 1
          const oldVal = this.notes[i][numberIndex]
          this.tempHistory.push({type: 'noteItem', cellIndex: i, numberIndex, value: oldVal})
          this.notes[i].splice(numberIndex, 1, oldVal > 0 ? 0 : value)
          this.setTemp(i, '')
        } else {
          this.playSound('temp')
          if (value !== this.temps[i] && value !== this.answer[i] && ++this.mistakes === 3) {
            return this.gameOver()
          }
          this.setTemp(i, value)
        }
      })
      this.pushHistory()
    },
    erase () {
      this.playSound('tool')
      this.getActiveIndexes(i => {
        this.resetNote(i)
        this.setTemp(i, '')
      })
      this.pushHistory()
    },
    undo () {
      if (this.paused || !this.histories.length) return
      this.playSound('tool')
      const lastHistories = this.histories.pop() || []
      lastHistories.forEach(({cellIndex, numberIndex, value, type}) => {
        switch (type) {
          case 'temp':
            this.setTemp(cellIndex, value)
            break
          case 'note':
            this.notes.splice(cellIndex, 1, value)
            break
          case 'noteItem':
            this.notes[cellIndex].splice(numberIndex, 1, value)
            break
        }
      })
    },
    resetNote (i) {
      if (this.notesState[i]) {
        this.tempHistory.push({type: 'note', cellIndex: i, value: this.notes[i]})
        this.notes.splice(i, 1, Array.from({length: 9}, () => 0))
      }
    },
    removeNoteItem (i, number) {
      if (this.notesState[i]) {
        const numberIndex = number - 1
        this.tempHistory.push({type: 'noteItem', cellIndex: i, numberIndex, value: this.notes[i][numberIndex]})
        this.notes[i].splice(numberIndex, 1, 0)
      }
    },
    setTemp (i, value = '') {
      const actualValue = value === this.temps[i] ? '' : value
      if (actualValue) {
        if (actualValue === this.answer[i] && ++this.corrects === 81) {
          return this.win()
        }
        this.resetNote(i)
      }
      if (this.temps[i] === this.answer[i]) {
        this.corrects--
      }
      this.tempHistory.push({type: 'temp', cellIndex: i, value: this.temps[i]})
      this.temps.splice(i, 1, actualValue)
      this.clearRelevantNotes(i, actualValue)
    },
    clearRelevantNotes (cellId, number) {
      if (!number) return
      const {row, col, box} = SUDOKU.addresses[cellId]
      this.boxes[box].forEach(cell => this.removeNoteItem(cell.id, number))
      this.notes.forEach((note, i) => {
        if (row === SUDOKU.addresses[i].row || col === SUDOKU.addresses[i].col) {
          this.removeNoteItem(i, number)
        }
      })
    },
    resetActives () {
      this.actives = Array.from({length: 81}, () => false)
    },
    getActiveIndexes (callback) {
      if (this.paused) return
      if (this.multiple) {
        this.actives.forEach((active, i) => {
          if (active) callback(i)
        })
        this.resetActives()
      } else if (this.active.id >= 0 && !this.active.value) {
        return callback(this.active.id)
      }
    },
    toggleNoting () {
      this.playSound('tool')
      this.noting = !this.noting
      if (!this.noting) {
        this.multiple = false
        this.resetActives()
      }
    },
    toggleMultiple () {
      this.playSound('tool')
      this.multiple = !this.multiple
      this.noting = this.multiple
      if (!this.multiple) {
        this.resetActives()
      } else if (this.active.id >= 0 && !this.active.value && !this.temps[this.active.id]) {
        this.actives.splice(this.active.id, 1, true)
        this.active = -1
      }
    },
    toggleMute () {
      this.mute = !this.mute
      this.playSound('tool')
    },
    playSound (soundName) {
      if (!this.mute && sounds[soundName]) {
        const sound = sounds[soundName]
        if (!sound.paused && !sound.ended && sound.currentTime && sound.readyState > 2) {
          sound.currentTime = 0
        } else {
          sound.load()
          sound.play()
        }
      }
    },
    onActiveChange (cell, e) {
      if (!cell || cell === this.active) return
      this.playSound('tap')
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
      const time = this.time
      this.highScores.push({time, completedAt: new Date().toLocaleDateString('vi')})
      this.highScores.sort((a, b) => a.time - b.time)
      this.highScores.splice(5)
      this.openPendingWindow()
    },
    openPendingWindow () {
      this.pending = true
      this.stopTimer()
    },
    togglePaused () {
      this.playSound('play')
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
    prettifyTime (seconds = 0, shouldPad = true) {
      if (!(seconds > -1)) return '00:00'
      const to2Letters = n => ('0' + n).slice(-2)
      const [hrs, mins, secs] = utils.getHms(seconds)
      return (hrs ? `${to2Letters(hrs)}:` : '') + `${shouldPad ? to2Letters(mins) : mins}:${to2Letters(secs)}`
    }
  }
}
</script>
