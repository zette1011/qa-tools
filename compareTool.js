(function(){
  if(document.getElementById('compareModal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #compareModal {
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      z-index: 999999;
      background: #fff;
      box-shadow: 0 0 10px #000;
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
    }
    #compareModal .modal-header {
      background: #222;
      color: #fff;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #compareModal .modal-header button {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    }
    #compareModal .modal-body {
      flex: 1;
      display: flex;
      gap: 10px;
      padding: 10px;
      overflow: auto;
    }
    #compareModal .editor {
      flex: 1;
      border: 1px solid #ccc;
      padding: 10px;
      background: #fefefe;
      overflow: auto;
      font-family: Arial, sans-serif;
    }
    #compareModal .editor[contenteditable=true]:focus {
      outline: 2px solid #4a90e2;
    }
    #compareModal .result {
      flex: 1;
      border: 1px solid #ccc;
      padding: 10px;
      background: #f9f9f9;
      overflow: auto;
      font-family: Arial, sans-serif;
    }
    #compareModal .modal-footer {
      padding: 10px;
      border-top: 1px solid #ccc;
      text-align: right;
    }
    #compareModal .editor ul,
    #compareModal .editor ol,
    #compareModal .result ul,
    #compareModal .result ol {
      padding-left: 1.5em;
      list-style-position: inside;
      margin: 0 0 1em 0;
    }
    #compareModal .editor li,
    #compareModal .result li {
      list-style-type: disc;
      margin-left: 0.5em;
    }
    mark.added { background: #c8facc; }
    mark.removed { background: #ffc8c8; }
    mark.edited { background: #fff3c4; }
    mark.partial { background: #cce5ff; }
    mark.misspelled { background: orange; }
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
    <div class="modal-body">
      <div id="leftResult" class="result"></div>
      <div id="rightResult" class="result"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Helper function to remove highlight or span styles from pasted content
  const sanitizeHTML = html =>
    html.replace(/(<[^>]+)(style="[^"]*background[^"]*")([^>]*>)/gi, '$1$3')
        .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');

  window.compareContent = function () {
    const l = document.getElementById("leftEditor");
    const r = document.getElementById("rightEditor");
    const lResult = document.getElementById("leftResult");
    const rResult = document.getElementById("rightResult");

    const lHTML = sanitizeHTML(l.innerHTML.trim());
    const rHTML = sanitizeHTML(r.innerHTML.trim());

    const lLines = lHTML.split(/<br\s*\/?>|\n/);
    const rLines = rHTML.split(/<br\s*\/?>|\n/);
    const max = Math.max(lLines.length, rLines.length);

    let leftOut = "", rightOut = "";

    for (let i = 0; i < max; i++) {
      const left = lLines[i] || "", right = rLines[i] || "";
      if (!left && right) {
        leftOut += `<br>`;
        rightOut += `<mark class="added">${right}</mark><br>`;
      } else if (left && !right) {
        leftOut += `<mark class="removed">${left}</mark><br>`;
        rightOut += `<br>`;
      } else if (left !== right) {
        leftOut += `<mark class="edited">${left}</mark><br>`;
        rightOut += `<mark class="edited">${right}</mark><br>`;
      } else {
        leftOut += `${left}<br>`;
        rightOut += `${right}<br>`;
      }
    }

    lResult.innerHTML = leftOut;
    rResult.innerHTML = rightOut;
  };
})();
