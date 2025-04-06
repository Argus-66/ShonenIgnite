# XP Calculation for Current Workout Data

This document shows the step-by-step XP calculation for the provided workout data using the value-based XP system.

## Workout Data By Date

### 2025-04-04

| Workout   | Status     | Value | Unit  | XP Rate       | Calculation | Earned XP           |
|-----------|------------|-------|-------|---------------|-------------|---------------------|
| Cycling   | Completed  | 10    | km    | 2 XP per km   | 10 × 2      | 20 XP               |
| Push-ups  | Completed  | 50    | reps  | 0.1 XP per rep| 50 × 0.1    | 5 XP                |
| Running   | Completed  | 10    | km    | 3 XP per km   | 10 × 3      | 30 XP               |
| Swimming  | Completed  | 2     | km    | 4 XP per km   | 2 × 4       | 8 XP                |

**Total for 2025-04-04 (before cap):** 20 + 5 + 30 + 8 = **63 XP**  
**Capped value:** 63 XP (under cap of 100)

### 2025-04-05

| Workout   | Status     | Value | Unit  | XP Rate       | Calculation | Earned XP           |
|-----------|------------|-------|-------|---------------|-------------|---------------------|
| Push-ups  | Completed  | 50    | reps  | 0.1 XP per rep| 50 × 0.1    | 5 XP                |
| Swimming  | Completed  | 2     | km    | 4 XP per km   | 2 × 4       | 8 XP                |

**Total for 2025-04-05 (before cap):** 5 + 8 = **13 XP**  
**Capped value:** 13 XP (under cap of 100)

### 2025-04-06

| Workout   | Status        | Value | Unit  | XP Rate       | Calculation | Earned XP           |
|-----------|---------------|-------|-------|---------------|-------------|---------------------|
| Cycling   | Completed     | 5     | km    | 2 XP per km   | 5 × 2       | 10 XP               |
| Push-ups  | Completed     | 30    | reps  | 0.1 XP per rep| 30 × 0.1    | 3 XP                |
| Running   | Completed     | 5     | km    | 3 XP per km   | 5 × 3       | 15 XP               |
| Squats    | Completed     | 30    | reps  | 0.1 XP per rep| 30 × 0.1    | 3 XP                |
| Swimming  | Not Completed | 0     | km    | 4 XP per km   | 0 × 4       | 0 XP (Not counted)  |

**Total for 2025-04-06 (before cap):** 10 + 3 + 15 + 3 = **31 XP**  
**Capped value:** 31 XP (under cap of 100)

## Overall XP Calculation

1. The system identifies all dates with workout data: 2025-04-04, 2025-04-05, 2025-04-06
2. For each date, it processes all workouts and calculates XP based on workout value and XP rate
3. Each day's XP is capped at 100 (none of our days exceed this)
4. Total XP is calculated as the sum of all daily XP

| Date | Daily XP |
|------|----------|
| 2025-04-04 | 63 |
| 2025-04-05 | 13 |
| 2025-04-06 | 31 |

**Total XP:** 63 + 13 + 31 = **107 XP**

## Key Observations

1. XP is now calculated based on the actual workout value (distance, reps, or time) instead of fixed base values
2. Each workout type has a specific XP rate based on its intensity and difficulty
3. The Swimming workout on 2025-04-06 has `completed: false`, so it doesn't contribute any XP
4. With the new value-based calculation, the total XP is higher (107 vs. 88 previously)
5. None of the days exceeded the 100 XP cap
6. Total XP is the sum of all daily XP values 