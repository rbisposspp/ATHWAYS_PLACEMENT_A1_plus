(function () {
  var GAME_ID = "quiz";
  var state = { showAnswers: false, lesson: null, activity: null, section: null, answer: "", pairs: [], attempts: 0, correct: 0 };

  function key(lessonId, activityId) { return "esl:lastScore:" + lessonId + ":" + activityId; }
  function n(value) { return String(value || "").trim().toLowerCase().replace(/\s+/g, " "); }
  function setStatus(text, cls) {
    var el = document.getElementById("status");
    if (!el) { return; }
    el.textContent = text || "";
    el.className = cls ? ("status " + cls) : "status";
  }
  function setScore(score) {
    if (!state.lesson || !state.activity) { return; }
    localStorage.setItem(key(state.lesson.id, state.activity.id), JSON.stringify({ game: GAME_ID, score: score, updatedAt: new Date().toISOString() }));
    var el = document.getElementById("score");
    if (el) { el.textContent = "Score: " + score + "%"; }
  }
  function answerOf(a) {
    if (a.answer) { return a.answer; }
    if (a.sampleAnswer) { return a.sampleAnswer; }
    if (Array.isArray(a.tokens) && a.tokens.length > 0) { return a.tokens.join(" "); }
    if (Array.isArray(a.options) && a.options.length > 0) { return a.options[0]; }
    if (Array.isArray(a.pairs) && a.pairs.length > 0) { return a.pairs[0].left + " -> " + a.pairs[0].right; }
    return "";
  }
  function pick(data, id) {
    var fallback = null;
    var sections = Array.isArray(data.sections) ? data.sections : [];
    for (var i = 0; i < sections.length; i += 1) {
      var sec = sections[i];
      var acts = Array.isArray(sec.activities) ? sec.activities : [];
      for (var j = 0; j < acts.length; j += 1) {
        var act = acts[j];
        if (!fallback) { fallback = { section: sec, activity: act }; }
        if (id && act.id === id) { return { section: sec, activity: act }; }
      }
    }
    return fallback;
  }
  function shuffle(arr) {
    var out = arr.slice();
    for (var i = out.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }

  function bindAnswers() {
    var btn = document.getElementById("toggle-answers");
    var box = document.getElementById("answers");
    if (!btn || !box) { return; }
    btn.addEventListener("click", function () {
      state.showAnswers = !state.showAnswers;
      btn.textContent = state.showAnswers ? "Hide answers" : "Show answers";
      box.classList.toggle("hidden", !state.showAnswers);
      if (GAME_ID === "wordmatch" && state.pairs.length > 0) {
        box.innerHTML = state.pairs.map(function (p) { return "<div>" + p.left + " -> " + p.right + "</div>"; }).join("");
      } else {
        box.textContent = state.answer ? ("Answer: " + state.answer) : "No answer available.";
      }
    });
  }

  function renderCommon() {
    var title = document.getElementById("activity-title");
    var type = document.getElementById("activity-type");
    var prompt = document.getElementById("activity-prompt");
    if (title && state.activity) { title.textContent = GAME_ID + " - " + state.activity.id; }
    if (type && state.activity) { type.textContent = "Type: " + state.activity.type; }
    if (prompt && state.activity) { prompt.textContent = state.activity.prompt; }
  }

  function renderFlashcards(root) {
    var face = document.createElement("div");
    face.className = "card";
    var showing = false;
    face.textContent = state.activity.prompt;
    root.appendChild(face);

    var row = document.createElement("div");
    row.className = "button-grid";
    var flip = document.createElement("button");
    flip.className = "btn alt";
    flip.textContent = "Flip";
    flip.onclick = function () { showing = !showing; face.textContent = showing ? (state.answer || "No answer.") : state.activity.prompt; };
    row.appendChild(flip);

    var ok = document.createElement("button");
    ok.className = "btn";
    ok.textContent = "I got it";
    ok.onclick = function () { state.attempts += 1; state.correct += 1; setScore(Math.round((state.correct / state.attempts) * 100)); setStatus("Great.", "ok"); };
    row.appendChild(ok);

    var retry = document.createElement("button");
    retry.className = "btn alt";
    retry.textContent = "Retry";
    retry.onclick = function () { state.attempts += 1; setScore(Math.round((state.correct / state.attempts) * 100)); setStatus("Try again.", "warn"); };
    row.appendChild(retry);
    root.appendChild(row);
  }

  function renderQuiz(root) {
    var options = Array.isArray(state.activity.options) && state.activity.options.length ? state.activity.options.slice() : (Array.isArray(state.activity.tokens) && state.activity.tokens.length ? state.activity.tokens.slice() : [state.answer || "No option"]);
    for (var i = 0; i < options.length; i += 1) {
      var label = document.createElement("label");
      label.className = "pair";
      label.style.gridTemplateColumns = "auto 1fr";
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "opt";
      radio.value = options[i];
      label.appendChild(radio);
      var span = document.createElement("span");
      span.textContent = options[i];
      label.appendChild(span);
      root.appendChild(label);
    }
    var check = document.createElement("button");
    check.className = "btn";
    check.textContent = "Check";
    check.onclick = function () {
      var picked = document.querySelector("input[name='opt']:checked");
      if (!picked) { setStatus("Select one option.", "warn"); return; }
      var ok = state.answer && n(picked.value) === n(state.answer);
      setScore(ok ? 100 : 0);
      setStatus(ok ? "Correct." : "Not yet.", ok ? "ok" : "warn");
    };
    root.appendChild(check);
  }

  function renderWordMatch(root) {
    state.pairs = Array.isArray(state.activity.pairs) && state.activity.pairs.length
      ? state.activity.pairs.map(function (p) { return { left: p.left, right: p.right }; })
      : (Array.isArray(state.activity.options) && state.activity.options.length
        ? state.activity.options.map(function (v, i) { return { left: "Item " + (i + 1), right: v }; })
        : []);
    if (state.pairs.length === 0) { setStatus("No pair data available.", "warn"); return; }
    var rights = shuffle(state.pairs.map(function (p) { return p.right; }));
    for (var i = 0; i < state.pairs.length; i += 1) {
      var pair = state.pairs[i];
      var row = document.createElement("div");
      row.className = "pair";
      var left = document.createElement("strong");
      left.textContent = pair.left;
      row.appendChild(left);
      var select = document.createElement("select");
      select.setAttribute("data-right", pair.right);
      var empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "Choose...";
      select.appendChild(empty);
      for (var j = 0; j < rights.length; j += 1) {
        var opt = document.createElement("option");
        opt.value = rights[j];
        opt.textContent = rights[j];
        select.appendChild(opt);
      }
      row.appendChild(select);
      root.appendChild(row);
    }
    var check = document.createElement("button");
    check.className = "btn";
    check.textContent = "Check";
    check.onclick = function () {
      var selects = root.querySelectorAll("select[data-right]");
      var good = 0;
      for (var s = 0; s < selects.length; s += 1) {
        var sel = selects[s];
        if (n(sel.value) === n(sel.getAttribute("data-right") || "")) { good += 1; }
      }
      var score = Math.round((good / selects.length) * 100);
      setScore(score);
      setStatus("Matched " + good + "/" + selects.length + ".", score === 100 ? "ok" : "warn");
    };
    root.appendChild(check);
  }

  function renderWordOrder(root) {
    var expected = state.answer || state.activity.prompt || "";
    var input = document.createElement("input");
    input.className = "input";
    input.placeholder = "Type or build the answer";
    root.appendChild(input);

    var bank = Array.isArray(state.activity.tokens) && state.activity.tokens.length ? state.activity.tokens.slice() : expected.split(/\s+/).filter(Boolean);
    if (bank.length > 0) {
      var grid = document.createElement("div");
      grid.className = "button-grid";
      shuffle(bank).forEach(function (token) {
        var b = document.createElement("button");
        b.className = "btn alt";
        b.type = "button";
        b.textContent = token;
        b.onclick = function () { input.value = (input.value ? input.value + " " : "") + token; };
        grid.appendChild(b);
      });
      root.appendChild(grid);
    }

    var row = document.createElement("div");
    row.className = "button-grid";
    var check = document.createElement("button");
    check.className = "btn";
    check.textContent = "Check";
    check.onclick = function () {
      var ok = expected && n(input.value) === n(expected);
      setScore(ok ? 100 : 0);
      setStatus(ok ? "Correct order." : "Not yet.", ok ? "ok" : "warn");
    };
    row.appendChild(check);
    var clear = document.createElement("button");
    clear.className = "btn alt";
    clear.textContent = "Clear";
    clear.onclick = function () { input.value = ""; };
    row.appendChild(clear);
    root.appendChild(row);
  }

  fetch("../../activities.json", { cache: "no-store" })
    .then(function (res) { if (!res.ok) { throw new Error("Could not load activities.json"); } return res.json(); })
    .then(function (data) {
      var id = new URLSearchParams(window.location.search).get("activity");
      var chosen = pick(data, id);
      if (!chosen) { throw new Error("No activities found."); }
      state.lesson = data.lesson;
      state.section = chosen.section;
      state.activity = chosen.activity;
      state.answer = answerOf(chosen.activity);
      renderCommon();
      bindAnswers();
      var root = document.getElementById("game-root");
      if (!root) { return; }
      root.innerHTML = "";
      if (GAME_ID === "flashcards") { renderFlashcards(root); return; }
      if (GAME_ID === "quiz") { renderQuiz(root); return; }
      if (GAME_ID === "wordmatch") { renderWordMatch(root); return; }
      renderWordOrder(root);
      setStatus("Ready.", "");
    })
    .catch(function (err) {
      setStatus("Error: " + String(err.message || err), "warn");
    });
})();