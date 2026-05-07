def get_neighbors(state, size):
    neighbors = []
    zero_idx = state.index(0)
    row, col = zero_idx // size, zero_idx % size
    
    moves = [(-1, 0), (1, 0), (0, -1), (0, 1)] 
    for dr, dc in moves:
        new_row, new_col = row + dr, col + dc
        if 0 <= new_row < size and 0 <= new_col < size:
            new_idx = new_row * size + new_col
            new_state = list(state)
            new_state[zero_idx], new_state[new_idx] = new_state[new_idx], new_state[zero_idx]
            neighbors.append(tuple(new_state))
    return neighbors