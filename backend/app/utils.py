def get_goal_positions(size: int):
    # Goal is [1, 2, ..., size*size-1, 0]
    positions = {}
    for i in range(1, size * size):
        positions[i] = ((i - 1) // size, (i - 1) % size)
    positions[0] = (size - 1, size - 1)
    return positions