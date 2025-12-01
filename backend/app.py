import os
import json
import time
import datetime as dt
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ============================================
# PATH CONFIG
# ============================================
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")
MOOD_FILE = os.path.join(DATA_DIR, "mood.json")
TIMELOG_FILE = os.path.join(DATA_DIR, "timelogs.json")
QUOTES_FILE = os.path.join(DATA_DIR, "quotes.json")
GOALS_FILE = os.path.join(DATA_DIR, "goals.json")
NOTIF_FILE = os.path.join(DATA_DIR, "notifications.json")


# ============================================
# HELPERS
# ============================================
def _load_json(path):
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []


def _save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _next_id(items):
    return 1 if not items else max(i.get("id", 0) for i in items) + 1


# ============================================
# SEED DATA
# ============================================
if not _load_json(QUOTES_FILE):
    _save_json(QUOTES_FILE, [
        "Consistency beats talent.",
        "Small steps every day lead to big results.",
        "Focus on progress, not perfection.",
        "Believe you can, and you're halfway there.",
        "Discipline builds success — not motivation."
    ])

if not _load_json(GOALS_FILE):
    _save_json(GOALS_FILE, [
        {"id": 1, "title": "Study 10 Hours", "target_minutes": 600, "progress_minutes": 0},
        {"id": 2, "title": "Finish E Tasks", "target_minutes": 120, "progress_minutes": 0}
    ])

if not _load_json(NOTIF_FILE):
    now = dt.datetime.now().isoformat()
    _save_json(NOTIF_FILE, [
        {"id": 1, "text": "Your exam is 2 days away", "time": now},
        {"id": 2, "text": "You studied 3 hours today", "time": now},
        {"id": 3, "text": "Practice guitar is due in 6 hours", "time": now},
    ])


# ============================================
# FASTAPI APP
# ============================================
app = FastAPI(title="Univ Assist Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# MODELS
# ============================================
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class ChatRequestV2(BaseModel):
    message: str
    mode: Optional[str] = "default"
    session_id: Optional[str] = "default"


class TaskIn(BaseModel):
    title: str
    description: Optional[str] = ""
    estimated_minutes: Optional[int] = 60
    priority: Optional[str] = "medium"


class TaskStatus(BaseModel):
    status: str


class MoodIn(BaseModel):
    mood: str
    intensity: Optional[int] = 5
    note: Optional[str] = ""


class StudyPlanRequest(BaseModel):
    days: Optional[int] = 7
    hours_per_day: Optional[int] = 3
    subjects: Optional[List[str]] = None
    start_hour: Optional[int] = 9


class TimerIn(BaseModel):
    task_id: int


class GoalIn(BaseModel):
    title: str
    target_minutes: int


class GoalPatch(BaseModel):
    progress_minutes: Optional[int] = None
    title: Optional[str] = None


# ============================================
# TASKS
# ============================================
def store_task(title, description, minutes, priority):
    tasks = _load_json(TASKS_FILE)
    tid = _next_id(tasks)
    task = {
        "id": tid,
        "title": title,
        "description": description,
        "estimated_minutes": minutes,
        "priority": priority,
        "status": "todo"
    }
    tasks.append(task)
    _save_json(TASKS_FILE, tasks)
    return task


def list_tasks(status=None):
    tasks = _load_json(TASKS_FILE)
    return tasks if not status else [t for t in tasks if t["status"] == status]


def update_task_status(task_id, status):
    tasks = _load_json(TASKS_FILE)
    for t in tasks:
        if t["id"] == task_id:
            t["status"] = status
            _save_json(TASKS_FILE, tasks)
            return t
    return None


# ============================================
# STUDY PLANNER (OLD)
# ============================================
def generate_study_plan():
    tasks = list_tasks()
    schedule = []
    start = dt.datetime.now().replace(hour=9, minute=0)

    for t in tasks:
        end = start + dt.timedelta(minutes=t["estimated_minutes"])
        schedule.append({
            "task_id": t["id"],
            "title": t["title"],
            "start": start.strftime("%H:%M"),
            "end": end.strftime("%H:%M")
        })
        start = end + dt.timedelta(minutes=10)

    return schedule


# ============================================
# AI STUDY PLAN (NEW ADVANCED)
# ============================================
def generate_study_plan_ai(days=7, hours_per_day=3, subjects=None, start_hour=9):
    tasks = list_tasks()
    plan = []

    # turn subjects into pseudo tasks
    if subjects:
        total_minutes = days * hours_per_day * 60
        per = int(total_minutes / len(subjects))
        tasks = [{"id": 1000 + i, "title": s, "estimated_minutes": per} for i, s in enumerate(subjects)]

    today = dt.date.today()

    for d in range(days):
        date = today + dt.timedelta(days=d)
        start = dt.datetime.combine(date, dt.time(hour=start_hour))
        mins_left = hours_per_day * 60

        day_blocks = []
        for t in tasks:
            if mins_left <= 0:
                break
            take = min(t["estimated_minutes"], mins_left)
            end = start + dt.timedelta(minutes=take)

            day_blocks.append({
                "title": t["title"],
                "start": start.strftime("%Y-%m-%d %H:%M"),
                "end": end.strftime("%Y-%m-%d %H:%M"),
                "minutes": take
            })

            t["estimated_minutes"] -= take
            mins_left -= take
            start = end + dt.timedelta(minutes=10)

        plan.append({"date": date.isoformat(), "blocks": day_blocks})

    return plan


# ============================================
# MOOD
# ============================================
def log_mood(mood, intensity, note):
    moods = _load_json(MOOD_FILE)
    entry = {
        "mood": mood,
        "intensity": intensity,
        "note": note,
        "timestamp": dt.datetime.now().isoformat()
    }
    moods.append(entry)
    _save_json(MOOD_FILE, moods)
    return entry


# ============================================
# TIMER / PRODUCTIVITY
# ============================================
def start_timer(task_id):
    logs = _load_json(TIMELOG_FILE)
    entry = {"id": _next_id(logs), "task_id": task_id, "start": time.time(), "running": True}
    logs.append(entry)
    _save_json(TIMELOG_FILE, logs)
    return entry


def stop_timer(task_id):
    logs = _load_json(TIMELOG_FILE)
    for log in reversed(logs):
        if log["task_id"] == task_id and log["running"]:
            elapsed = int((time.time() - log["start"]) / 60)
            log["running"] = False
            log["elapsed_minutes"] = elapsed
            log["stopped_at"] = dt.datetime.now().isoformat()
            _save_json(TIMELOG_FILE, logs)
            return {"task_id": task_id, "minutes": elapsed}
    return {"error": "No running timer found"}


def compute_weekly_productivity():
    logs = _load_json(TIMELOG_FILE)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    totals = {d: 0 for d in days}

    for log in logs:
        if "elapsed_minutes" not in log:
            continue
        try:
            wd = dt.datetime.fromisoformat(log["stopped_at"]).weekday()
            totals[days[wd]] += log["elapsed_minutes"]
        except:
            pass

    bars = [min(100, int(t / 120 * 100)) for t in totals.values()]
    percent = int(sum(bars) / 7)
    return {"days": days, "bars": bars, "percent": percent}


# FULL PRODUCTIVITY (NEW)
@app.get("/api/productivity/full")
def productivity_full():
    logs = _load_json(TIMELOG_FILE)
    today = dt.date.today()

    last_days = [(today - dt.timedelta(days=i)) for i in reversed(range(7))]
    totals = {d.isoformat(): 0 for d in last_days}

    for log in logs:
        if "elapsed_minutes" in log and "stopped_at" in log:
            try:
                d = dt.datetime.fromisoformat(log["stopped_at"]).date().isoformat()
                if d in totals:
                    totals[d] += log["elapsed_minutes"]
            except:
                pass

    bars = []
    raw = []
    for d in last_days:
        mins = totals[d.isoformat()]
        bars.append(min(100, int(mins / 120 * 100)))
        raw.append({"date": d.isoformat(), "minutes": mins})

    labels = [d.strftime("%a") for d in last_days]
    percent = int(sum(bars) / 7)

    return {"days": labels, "bars": bars, "percent": percent, "raw": raw}


# ============================================
# MOOD LAST 7 DAYS (NEW)
# ============================================
@app.get("/api/mood/last7")
def mood_last7():
    all_mood = _load_json(MOOD_FILE)
    last7 = all_mood[-7:]
    out = []

    for m in last7:
        try:
            ts = dt.datetime.fromisoformat(m["timestamp"])
            day = ts.strftime("%a")
        except:
            day = ""
        out.append({
            "day": day,
            "mood": m.get("mood"),
            "intensity": m.get("intensity", 5),
            "timestamp": m.get("timestamp")
        })

    return {"last7": out}


# ============================================
# GOALS / NOTIFICATIONS
# ============================================
def list_goals():
    return _load_json(GOALS_FILE)


def add_goal(title, minutes):
    goals = _load_json(GOALS_FILE)
    gid = _next_id(goals)
    goal = {"id": gid, "title": title, "target_minutes": minutes, "progress_minutes": 0}
    goals.append(goal)
    _save_json(GOALS_FILE, goals)
    return goal


def list_notifications():
    return _load_json(NOTIF_FILE)


# ============================================
# CHAT MODE (NEW)
# ============================================
async def fallback_chat_mode(msg: str, mode: str):
    low = msg.lower()

    if mode == "study":
        return "Focus for 25–50 minutes. Ask me for a 7-day study plan anytime."

    if mode == "tasks":
        return "I can help you organize and prioritize your tasks."

    if mode == "mentor":
        return "As your mentor: Break goals into tiny steps and stay consistent."

    if mode == "motivation":
        return "You are stronger than you think — keep going!"

    return "Hello! Ask me about tasks, study plan, mood, or productivity."


# ============================================
# ROUTES
# ============================================
@app.post("/api/chat")
async def chat_api(req: ChatRequest):
    reply = await fallback_chat_mode(req.message, "default")
    return {"reply": reply}


@app.post("/api/chat_v2")
async def chat_api_v2(req: ChatRequestV2):
    reply = await fallback_chat_mode(req.message, req.mode)
    return {"reply": reply, "mode": req.mode}


@app.get("/api/tasks")
def get_tasks():
    return {"tasks": list_tasks()}


@app.post("/api/tasks")
def add_task_api(t: TaskIn):
    return {"task": store_task(t.title, t.description, t.estimated_minutes, t.priority)}


@app.patch("/api/tasks/{task_id}/status")
def update_task_status_api(task_id: int, body: TaskStatus):
    task = update_task_status(task_id, body.status)
    if not task:
        raise HTTPException(404)
    return {"task": task}


@app.get("/api/planner")
def get_planner():
    return {"plan": generate_study_plan()}


@app.post("/api/studyplan")
def get_studyplan(req: StudyPlanRequest):
    plan = generate_study_plan_ai(
        days=req.days,
        hours_per_day=req.hours_per_day,
        subjects=req.subjects,
        start_hour=req.start_hour
    )
    return {"plan": plan}


@app.post("/api/mood")
def mood_api(m: MoodIn):
    return {"entry": log_mood(m.mood, m.intensity, m.note)}


@app.get("/api/mood")
def get_moods():
    return {"mood": _load_json(MOOD_FILE)}


@app.get("/api/productivity")
def productivity_api():
    return compute_weekly_productivity()


@app.get("/api/goals")
def goals_api():
    return {"goals": list_goals()}


@app.post("/api/goals")
def add_goal_api(g: GoalIn):
    return {"goal": add_goal(g.title, g.target_minutes)}


@app.get("/api/notifications")
def get_notifications():
    return {"notifications": list_notifications()}


@app.get("/api/quotes/daily")
def get_quote():
    quotes = _load_json(QUOTES_FILE)
    idx = dt.date.today().day % len(quotes)
    return {"quote": quotes[idx]}


@app.get("/api/health")
def health():
    return {"status": "ok"}
