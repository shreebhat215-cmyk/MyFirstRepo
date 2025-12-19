document.addEventListener("DOMContentLoaded", () => {

  // -------- ELEMENTS --------
  const taskInput = document.getElementById("taskInput");
  const priority = document.getElementById("priority");
  const taskList = document.getElementById("taskList");
  const todayTime = document.getElementById("todayTime");
  const streakEl = document.getElementById("streak");
  const aiTip = document.getElementById("aiTip");
  const pomoDisplay = document.getElementById("pomoDisplay");

  // -------- STATE --------
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let streak = Number(localStorage.getItem("streak")) || 0;
  let taskTimer = null;

  // -------- TASKS --------
  function addTask() {
    if (!taskInput.value.trim()) return;

    tasks.push({
      id: Date.now(),
      name: taskInput.value,
      priority: priority.value,
      time: 0
    });

    taskInput.value = "";
    save();
  }

  function startTask(id) {
    stopTask();
    taskTimer = setInterval(() => {
      const t = tasks.find(x => x.id === id);
      if (!t) return;
      t.time++;
      save(false);
    }, 1000);
  }

  function stopTask() {
    clearInterval(taskTimer);
    taskTimer = null;
  }

  function deleteTask(id) {
    stopTask();
    tasks = tasks.filter(t => t.id !== id);
    save();
  }

  function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach(t => {
      const li = document.createElement("li");
      li.innerHTML = `
        <b>${t.name}</b> (${t.priority})<br>
        ${format(t.time)}
        <div>
          <button type="button" onclick="startTask(${t.id})">▶</button>
          <button type="button" onclick="stopTask()">⏸</button>
          <button type="button" onclick="deleteTask(${t.id})">🗑</button>
        </div>
      `;
      taskList.appendChild(li);
    });
  }

  // -------- TIME --------
  function updateToday() {
    const total = tasks.reduce((a,t)=>a+t.time,0);
    todayTime.innerText = format(total);
    streakEl.innerText = `🔥 ${streak}`;
  }

  function format(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2,"0")}:${m
      .toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  }

  // -------- POMODORO --------
  let pomo = 1500;
  const POMO_TOTAL = 1500;
  let pomoTimer = null;

  function updatePomo() {
  const m = Math.floor(pomo / 60);
  const s = pomo % 60;
  pomoDisplay.innerText = `${m}:${s.toString().padStart(2,"0")}`;

  const progress = ((POMO_TOTAL - pomo) / POMO_TOTAL) * 100;
  document.getElementById("pomoProgress").style.width = `${progress}%`;
}
  function startPomodoro() {
    clearInterval(pomoTimer);
    pomoTimer = setInterval(() => {
      pomo--;
      updatePomo();
      if (pomo <= 0) {
        clearInterval(pomoTimer);
        pomoTimer = null;
        alert("Pomodoro complete! 🌿");
        pomo = 1500;
        updatePomo();
      }
    }, 1000);
  }

  function stopPomodoro() {
    clearInterval(pomoTimer);
    pomoTimer = null;
  }

  function resetPomodoro() {
  stopPomodoro();
  pomo = POMO_TOTAL;
  updatePomo();
}
  // -------- AI --------
  function updateAI() {
    if (!tasks.length) {
      aiTip.innerText = "Add tasks to get study guidance.";
      return;
    }
    const least = [...tasks].sort((a,b)=>a.time-b.time)[0];
    aiTip.innerText = `Focus on "${least.name}" next.`;
  }

  // -------- STORAGE --------
  function save(render = true) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    if (render) renderTasks();
    updateToday();
    updateAI();
  }

  // -------- DARK MODE --------
  function toggleDark() {
    document.body.classList.toggle("dark");
  }

  // -------- EXPOSE --------
  window.addTask = addTask;
  window.startTask = startTask;
  window.stopTask = stopTask;
  window.deleteTask = deleteTask;
  window.startPomodoro = startPomodoro;
  window.stopPomodoro = stopPomodoro;
  window.resetPomodoro = resetPomodoro;
  window.toggleDark = toggleDark;

  // -------- INIT --------
  renderTasks();
  updateToday();
  updatePomo();
  updateAI();

});