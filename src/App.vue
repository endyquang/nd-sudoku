<template>
  <div id="app" @touchmove="preventDefault">
    <div class="pending" v-if="pending">
      <div class="pending__logo">
        NUDOKU
      </div>
      <template v-if="won">
        <div class="pending__noti" v-if="won">YOU'VE LUCKYLY WON!</div>
        <div class="pending__score"></div>
      </template>
      <div class="pending__noti" v-else-if="lost">YOU DUMBASS LOSER!</div>
      <div class="pending__subtitle" v-else>Just a dummy text to make it look not as empty as its creator</div>
      <base-btn @click="start" class="pending__start">PLAY {{won || lost ? 'AGAIN' : 'NOW'}}</base-btn>
    </div>
    <header class="header">
      <span>Mistakes: {{mistakes}}/3</span>
      <base-btn @click="togglePaused">
        {{time | prettifyTime}} <span style="color: #aaa;">{{paused ? '&#10074;&#10074;' : '&#9654;'}}</span>
      </base-btn>
      <base-btn @click="start">New Game</base-btn>
    </header>
    <main class="main">
      <div class="paused" v-if="paused">
        <div class="paused__content">
          <base-btn @click="togglePaused">&#9654;</base-btn>
        </div>
      </div>
      <div class="play" :class="{'play--paused': paused}">
        <div class="play__block" v-for="(block, b) in blocks" :key="`b-${b}`">
          <template v-for="cell in block">
            <div class="play__cell" v-if="paused" :key="cell.id" />
            <div
              v-else
              class="play__cell"
              :class="{
                'selected': actives[cell.id],
                'active': active === cell,
                'affected': !multiple && (b === active.block || cell.row === active.row || cell.col === active.col),
                'same': temps[active.id] && temps[active.id] === temps[cell.id]
              }"
              :key="cell.id"
              ref="cells"
              @click="onActiveChange(cell)"
            >
              <div
                v-if="cell.value"
                class="play__cell__fixed"
              >{{cell.value}}</div>
              <div class="play__cell__notes" v-else-if="notesState[cell.id]">
                <div class="play__cell__notes__item" v-for="(note, n) in notes[cell.id]" :key="n">
                  {{note > 0 ? note : ''}}
                </div>
              </div>
              <div
                v-else-if="temps[cell.id]"
                class="play__cell__temp"
                :class="{wrong: temps[cell.id] !== answer[cell.id]}"
              >
                {{temps[cell.id]}}
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="controls">
        <base-btn @click="noting = !noting" :class="{'primary': noting}">&#9998; Note {{noting ? 'On' : 'Off'}}</base-btn>
        <base-btn @click="erase">&#10008; Erase</base-btn>
        <base-btn @click="onMultipleChange" :class="{'primary': multiple}">&#9964; Multiple</base-btn>
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
import sudoku from './sudoku'
import BaseBtn from '@/atoms/BaseBtn'

function _getHms (seconds = 0) {
  const secsPerHr = 60 * 60
  const secsPerMin = 60
  const hrs = Math.floor(seconds / secsPerHr)
  const mins = Math.floor((seconds - hrs * secsPerHr) / secsPerMin)
  const secs = Math.floor(seconds - hrs * secsPerHr - mins * secsPerMin)
  return [hrs, mins, secs]
}

export default {
  name: 'app',
  components: {
    BaseBtn
  },
  data () {
    return {
      blocks: [],
      answer: [],
      mistakes: 0,
      time: 0,
      active: -1,
      actives: [],
      difficulty: 'hardest',
      temps: [],
      notes: [],
      noting: false,
      pending: true,
      won: false,
      lost: false,
      paused: false,
      multiple: false,
      timer: null
    }
  },
  computed: {
    notesState () {
      return this.notes.map(note => note.filter(n => n > 0).length)
    },
    filledNumbers () {
      const filleds = Array.from({length: 9}, () => 0)
      this.temps.forEach((a, i) => {
        if (a > 0) filleds[a - 1]++
      })
      return filleds
    },
    corrects () {
      const c = 0
      const answer = this.answer
      return this.temps.filter((temp, i) => temp === answer[i]).length
    }
  },
  methods: {
    start () {
      if (this.time > 0) this.stopTimer()
      const {blocks, answer, trimmedAnswer} = sudoku.generate('hardest')
      this.blocks = blocks
      this.answer = answer
      this.temps = trimmedAnswer
      this.mistakes = 0
      this.time = 0
      this.active = -1
      this.pending = false
      this.multiple = false
      this.timer = null
      this.actives = Array.from({length: 81}, () => false)
      this.notes = Array.from({length: 81}, () => Array.from({length: 9}, (n, i) => -(i + 1)))
      this.startTimer()
    },
    startTimer () {
      this.timer = setInterval(() => this.time++, 1000)
    },
    stopTimer () {
      clearInterval(this.timer)
    },
    newTemp (n) {
      if (this.paused) return
      const indexes = []
      if (this.multiple) {
        this.actives.forEach((active, i) => {
          if (active) indexes.push(i)
        })
      } else if (this.active.id && !this.active.value) {
        indexes.push(this.active.id)
      } else {
        return
      }
      indexes.forEach(i => {
        if (this.noting) {
          this.notes[i].splice(n - 1, 1, -this.notes[i][n - 1])
          if (this.temps[i]) this.temps.splice(i, 1, '')
        } else {
          if (this.notesState[i]) {
            this.resetNote(i)
          }
          this.temps.splice(i, 1, this.temps[i] === n ? '' : n)
          if (this.temps[i] && n !== this.answer[i]) {
            this.mistakes++
            if (this.mistakes === 3) {
              this.gameOver()
            }
          } else if (this.corrects === 81) {
            this.win()
          }
        }
      })
    },
    erase () {
      if (this.active.value) return
      const i = this.active.id
      if (this.notesState[i]) {
        this.resetNote(i)
      }
      if (this.temps[i]) {
        this.temps.splice(i, 1, '')
      }
    },
    resetNote (i) {
      this.notes.splice(i, 1, Array.from({length: 9}, (n, i) => -(i + 1)))
    },
    gameOver () {
      this.lost = true
      this.pending = true
      this.stopTimer()
    },
    win () {
      this.won = true
      this.pending = true
      this.stopTimer()
    },
    togglePaused () {
      this.paused = !this.paused
      if (this.paused) this.stopTimer()
      else this.startTimer()
    },
    onMultipleChange () {
      this.multiple = !this.multiple
      if (!this.multiple) {
        this.actives = Array.from({length: 81}, () => false)
      }
    },
    onActiveChange (cell) {
      if (this.multiple && !cell.value) {
        this.actives.splice(cell.id, 1, !this.actives[cell.id])
      } else {
        this.active = cell
      }
    },
    preventDefault (e) {
      e.preventDefault()
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
