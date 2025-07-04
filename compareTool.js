(function(){
  if(document.getElementById('compareModal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #compareModal{position:fixed;top:20px;left:20px;right:20px;bottom:20px;z-index:999999;background:#fff;box-shadow:0 0 10px #000;display:flex;flex-direction:column;font-family:Arial,sans-serif}
    #compareModal .modal-header{background:#222;color:#fff;padding:10px;display:flex;justify-content:space-between;align-items:center}
    #compareModal .modal-body{flex:1;display:flex;padding:10px;gap:10px;overflow:auto}
    #compareModal .modal-footer{padding:10px;border-top:1px solid #ccc;text-align:right}
    #compareModal .editor{flex:1;border:1px solid #ccc;padding:10px;background:#fefefe;overflow:auto;font-family:Arial,sans-serif}
    #compareModal .editor[contenteditable=true]:focus{outline:2px solid #4a90e2}
    #compareModal .results{display:flex;gap:10px;margin-top:10px;flex:1;overflow:auto}
    #compareModal .result{flex:1;border:1px solid #ccc;padding:10px;background:#fff;white-space:pre-wrap;overflow:auto;font-family:Arial,sans-serif}
    mark.added{background:#c8facc}mark.removed{background:#ffc8c8}mark.edited{background:#fff3c4}mark.partial{background:#cce5ff}mark.misspelled{background:orange}
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.id = 'compareModal';
  modal.innerHTML = `
    <div class="modal-header">
      <strong>📝 Rich Text Comparator</strong>
      <button onclick="document.body.removeChild(document.getElementById('compareModal'))">✖ Close</button>
    </div>
    <div class="modal-body">
      <div id="leftEditor" class="editor" contenteditable="true" placeholder="Paste Google Docs content here"></div>
      <div id="rightEditor" class="editor" contenteditable="true" placeholder="Paste Website content here"></div>
    </div>
    <div class="modal-footer">
      <button onclick="compareContent()">🔍 Compare</button>
    </div>
    <div class="results">
      <div id="leftResult" class="result"></div>
      <div id="rightResult" class="result"></div>
    </div>
  `;
  document.body.appendChild(modal);

  function sanitizeClone(node) {
    const clone = node.cloneNode(true);
    clone.querySelectorAll("mark").forEach(m => m.replaceWith(...m.childNodes));
    return clone;
  }

  function getWords(node) {
    const text = node.textContent;
    return text ? text.trim().split(/(\s+)/) : [];
  }

  function diffWords(aWords, bWords) {
    const diffs = [];
    const len = Math.max(aWords.length, bWords.length);
    for (let i = 0; i < len; i++) {
      const a = aWords[i] || "";
      const b = bWords[i] || "";
      if (a === b) {
        diffs.push([a, null]);
      } else if (!a) {
        diffs.push([b, "added"]);
      } else if (!b) {
        diffs.push([a, "removed"]);
      } else {
        diffs.push([a, "edited"]);
      }
    }
    return diffs;
  }

  function renderDiff(container, node, diffs) {
    container.innerHTML = '';
    const span = document.createElement('span');
    diffs.forEach(([word, type]) => {
      if (!type) {
        span.append(word);
      } else {
        const m = document.createElement("mark");
        m.className = type;
        m.textContent = word;
        span.appendChild(m);
      }
    });
    container.appendChild(span);
  }

  window.compareContent = function() {
    const lEditor = document.getElementById("leftEditor");
    const rEditor = document.getElementById("rightEditor");
    const lClone = sanitizeClone(lEditor);
    const rClone = sanitizeClone(rEditor);

    const lWords = getWords(lClone);
    const rWords = getWords(rClone);
    const lDiff = diffWords(lWords, rWords);
    const rDiff = diffWords(rWords, lWords);

    const lResult = document.getElementById("leftResult");
    const rResult = document.getElementById("rightResult");

    renderDiff(lResult, lClone, lDiff);
    renderDiff(rResult, rClone, rDiff);
  };
})();
