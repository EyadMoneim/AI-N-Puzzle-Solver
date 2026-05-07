import math

def h_misplaced(state, size, goal_pos):
    count = 0
    for i in range(size * size):
        if state[i] != 0 and state[i] != i + 1:
            if not (state[i] == 0 and i == size * size - 1):
                count += 1
    return count

def h_manhattan(state, size, goal_pos):
    dist = 0
    for i in range(size * size):
        val = state[i]
        if val != 0:
            current_row, current_col = i // size, i % size
            goal_row, goal_col = goal_pos[val]
            dist += abs(current_row - goal_row) + abs(current_col - goal_col)
    return dist

def h_euclidean(state, size, goal_pos):
    dist = 0
    for i in range(size * size):
        val = state[i]
        if val != 0:
            current_row, current_col = i // size, i % size
            goal_row, goal_col = goal_pos[val]
            dist += math.sqrt((current_row - goal_row)**2 + (current_col - goal_col)**2)
    return dist

def h_linear_conflict(state, size, goal_pos):
    manhattan_dist = h_manhattan(state, size, goal_pos)
    conflict = 0
    
    for row in range(size):
        for col1 in range(size):
            for col2 in range(col1 + 1, size):
                val1, val2 = state[row * size + col1], state[row * size + col2]
                if val1 != 0 and val2 != 0:
                    goal1, goal2 = goal_pos[val1], goal_pos[val2]
                    if goal1[0] == row and goal2[0] == row and goal1[1] > goal2[1]:
                        conflict += 2

    for col in range(size):
        for row1 in range(size):
            for row2 in range(row1 + 1, size):
                val1, val2 = state[row1 * size + col], state[row2 * size + col]
                if val1 != 0 and val2 != 0:
                    goal1, goal2 = goal_pos[val1], goal_pos[val2]
                    if goal1[1] == col and goal2[1] == col and goal1[0] > goal2[0]:
                        conflict += 2
                        
    return manhattan_dist + conflict