(function () {
  var games = ["flashcards", "quiz", "wordmatch", "wordorder"];
  var labels = { flashcards: "Flashcards", quiz: "Quiz", wordmatch: "Word Match", wordorder: "Word Order" };
  var defaults = { multiple_choice: "quiz", fill_in_blank: "wordorder", matching: "wordmatch", open_ended: "flashcards" };
  var gameAlias = { quiz: "quiz", game_wordorder: "wordorder", game_wordmatch: "wordmatch", flashcards: "flashcards" };

  function scoreKey(lessonId, activityId) { return "esl:lastScore:" + lessonId + ":" + activityId; }

  function lastScore(lessonId, activityId) {
    try {
      var raw = localStorage.getItem(scoreKey(lessonId, activityId));
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  function addButtons(root, activity) {
    var preferred = gameAlias[activity.game] || defaults[activity.type] || "flashcards";
    var grid = document.createElement("div");
    grid.className = "button-grid";
    for (var i = 0; i < games.length; i += 1) {
      var game = games[i];
      var link = document.createElement("a");
      link.className = game === preferred ? "btn-link" : "btn-link alt";
      link.href = "./games/" + game + "/index.html?activity=" + encodeURIComponent(activity.id);
      link.textContent = labels[game];
      grid.appendChild(link);
    }
    root.appendChild(grid);
  }

  function render(data) {
    var title = document.getElementById("lesson-title");
    var meta = document.getElementById("lesson-meta");
    var sectionsEl = document.getElementById("sections");
    if (!title || !meta || !sectionsEl) { return; }

    title.textContent = data.lesson.title || "Lesson";
    var cefr = data.lesson.cefr ? (" | " + data.lesson.cefr) : "";
    meta.textContent = (data.lesson.description || "Offline dashboard") + cefr;
    sectionsEl.innerHTML = "";

    var sections = Array.isArray(data.sections) ? data.sections : [];
    for (var s = 0; s < sections.length; s += 1) {
      var section = sections[s];
      var card = document.createElement("section");
      card.className = "card stack";
      var h2 = document.createElement("h2");
      h2.textContent = section.title || ("Section " + (s + 1));
      card.appendChild(h2);

      var items = Array.isArray(section.activities) ? section.activities : [];
      for (var i = 0; i < items.length; i += 1) {
        var activity = items[i];
        var item = document.createElement("article");
        item.className = "activity";
        var h3 = document.createElement("h3");
        h3.textContent = activity.id + " (" + activity.type + ")";
        item.appendChild(h3);
        var p = document.createElement("p");
        p.textContent = activity.prompt || "Activity";
        item.appendChild(p);

        var score = lastScore(data.lesson.id, activity.id);
        var scoreLine = document.createElement("p");
        scoreLine.className = "muted";
        scoreLine.textContent = score ? ("Last score: " + score.score + "% (" + score.game + ")") : "Last score: --";
        item.appendChild(scoreLine);

        addButtons(item, activity);
        card.appendChild(item);
      }
      sectionsEl.appendChild(card);
    }
  }

  fetch("./activities.json", { cache: "no-store" })
    .then(function (res) { if (!res.ok) { throw new Error("Could not load activities.json"); } return res.json(); })
    .then(render)
    .catch(function (err) {
      var sectionsEl = document.getElementById("sections");
      if (sectionsEl) { sectionsEl.textContent = "Error: " + String(err.message || err); }
    });
})();