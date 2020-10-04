import json

class Score():
    """
    Holds the numbers for scores, like win/loss/tie
    """
    
    def __init__(self, name = "noname", score_count = "2"):
        # order of object variables matters because we render json with vars()
        self.name = name
        self.score_count = score_count
        self.scores = [0] * self.score_count
        self.id = id(self)

    def emit(self):
        return {
            'name': self.name,
            'id': self.id,
            'scores': self.scores
        }

    def increment_number(self, idx):
        if idx >= 0 and idx < self.score_count:
            self.scores[idx] += 1
        else:
            return None

    def decrement_number(self, idx):
        if idx >= 0 and idx < self.score_count:
            self.scores[idx] -= 1
        else:
            return None

    def reset(self):
        self.scores = [0] * self.score_count

    def get_name(self):
        return self.name

    def get_scores(self):
        return self.scores

    def get_score(self, idx):
        if idx >= 0 and idx < self.score_count:
            return self.scores[idx]
        else:
            return None

    def get_id(self):
        return self.id
