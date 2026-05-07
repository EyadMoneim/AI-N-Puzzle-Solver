from pydantic import BaseModel

class PuzzleRequest(BaseModel):
    initial_state: list[int]
    size: int  # 3, 4, or 5
    heuristic: str