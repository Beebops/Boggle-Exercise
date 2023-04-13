from flask import Flask, request, render_template, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from boggle import Boggle

app = Flask(__name__)
app.config['SECRET_KEY'] = "oh-so-secret"
app.debug = True
debug = DebugToolbarExtension(app)

boggle_game = Boggle()

@app.route('/')
def show_board():
    """Shows a random boggle board and stores it along with the score in the session"""
    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get('highscore', 0)
    num_plays = session.get('num_plays', 0)

    return render_template('index.html', board=board, num_plays=num_plays, highscore=highscore)

@app.route('/check-word')
def check_word():
    """check if word entered is a valid word in the dictionary"""
    board = session['board']
    word = request.args['word']
    result = boggle_game.check_valid_word(board, word)

    return jsonify(result)

@app.route('/check-stats', methods=['POST'])
def check_stats():
    """receives highscore and number of plays when game is over"""
    
    score = request.json['score']
    highscore = session.get('highscore', 0)
    num_plays = session.get('num_plays', 0)
    # why are my number of plays not getting updated
    session['num_plays'] = num_plays + 1
    session['highscore'] = max(score, highscore)

    return jsonify(newHighScore=score > highscore)
