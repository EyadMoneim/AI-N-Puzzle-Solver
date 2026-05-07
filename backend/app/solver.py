import heapq
import time
from app.utils import get_goal_positions
from app.puzzle import get_neighbors
from app.heuristics import h_misplaced, h_manhattan, h_euclidean, h_linear_conflict

# دالة مساعدة لاسترجاع المسار في النهاية فقط بدل تخزينه في كل خطوة
def reconstruct_path(came_from, current_state):
    path = [list(current_state)]
    while current_state in came_from:
        current_state = came_from[current_state]
        path.append(list(current_state))
    path.reverse()
    return path

def solve_puzzle(initial_state, size, heuristic_name):
    initial_tuple = tuple(initial_state)
    goal_state = tuple(list(range(1, size * size)) + [0])
    
    if initial_tuple == goal_state:
        return {"path": [initial_state], "expanded_nodes": 0, "time_taken": 0}

    goal_pos = get_goal_positions(size)
    
    # tie_breaker بيمنع تعارض الـ Priority Queue لو الـ f_score متساوي
    tie_breaker = 0 
    pq = []
    
    # هندخل (f_score, tie_breaker, g_score, current_state)
    heapq.heappush(pq, (0, tie_breaker, 0, initial_tuple))
    
    came_from = {} # قاموس لتخزين الأب لكل حالة (بيوفر ميموري رهيبة)
    visited = set()
    visited.add(initial_tuple)
    
    nodes_expanded = 0
    start_time = time.time()
    
    while pq:
        f, _, g, current_state = heapq.heappop(pq)
        
        if current_state == goal_state:
            return {
                "path": reconstruct_path(came_from, current_state),
                "expanded_nodes": nodes_expanded,
                "time_taken": round(time.time() - start_time, 4)
            }
            
        nodes_expanded += 1
        
        # زودنا الوقت لـ 30 ثانية علشان ندي فرصة للأحجام الكبيرة
        if time.time() - start_time > 30:
            return {"error": "Timeout! The puzzle is too scrambled for basic A*. Please try a smaller shuffle."}

        for neighbor in get_neighbors(current_state, size):
            if neighbor not in visited:
                visited.add(neighbor)
                came_from[neighbor] = current_state # بنسجل إن الجار ده جينا له من الحالة الحالية
                new_g = g + 1
                
                if heuristic_name == "misplaced":
                    h = h_misplaced(neighbor, size, goal_pos)
                elif heuristic_name == "manhattan":
                    h = h_manhattan(neighbor, size, goal_pos)
                elif heuristic_name == "euclidean":
                    h = h_euclidean(neighbor, size, goal_pos)
                elif heuristic_name == "linear_conflict":
                    h = h_linear_conflict(neighbor, size, goal_pos)
                else:
                    h = 0
                
                new_f = new_g + h
                tie_breaker += 1
                heapq.heappush(pq, (new_f, tie_breaker, new_g, neighbor))
                
    return {"error": "No solution found."}