document.querySelector('form').addEventListener('submit', checkWord)
document.onreadystatechange = () => {
  if (document.readyState === 'interactive') {
    countDown()
  }
}

let words = new Set()
let score = 0
let seconds = 60
const timerId = setInterval(countDown, 1000)

//send the word to server and check if its valid
async function checkWord(e) {
  e.preventDefault()
  const word = document.querySelector('input').value
  if (!word) return
  if (words.has(word)) {
    showMessage('Word has already been used!')
    return
  }

  const { data } = await axios.get('/check-word', { params: { word: word } })
  if (data === 'not-word') {
    showMessage("That's not a valid word!")
  } else if (data === 'not-on-board') {
    showMessage('That word is not on the board!')
  } else {
    words.add(word)
    const wordsFound = document.querySelector('ul')
    const wordLi = document.createElement('li')
    wordLi.textContent = word
    wordsFound.appendChild(wordLi)
    score += word.length
    showScore()
    showMessage('')
  }

  document.querySelector('form').reset()
}

function showScore() {
  document.querySelector('#score').textContent = score
}

function showMessage(msg) {
  document.querySelector('.message').textContent = msg
}

// a timer to ensure user can only play the game for 60 seconds
async function countDown() {
  seconds -= 1
  const timer = document.querySelector('#timer')
  timer.textContent = seconds
  if (seconds === 0) {
    clearInterval(timerId)
    await checkStats()
  }
}

async function checkStats() {
  // send currentScore to server to see if new high score achieved
  document.querySelector('form').remove()
  const response = await axios({
    method: 'POST',
    url: '/check-stats',
    data: {
      score: score,
    },
  })
  if (response.data.newHighScore) {
    showMessage('NEW HIGH SCORE!!!')
  } else {
    showMessage(`Final score: ${score}`)
  }
}
