from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import PuzzleRequest
from app.solver import solve_puzzle

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/solve")
def solve_endpoint(req: PuzzleRequest):
    return solve_puzzle(req.initial_state, req.size, req.heuristic)