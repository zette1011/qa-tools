(function(){
  if(document.getElementById('compareModal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #compareModal {
      position: fixed;
      top: 20px; left: 20px; right: 20px; bottom: 20px;
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
      font-size: 18px;
      color: white;
      cursor: pointer;
    }
    #compareModal .modal-body {
      display: flex;
      gap: 10px;
      padding: 10px;
      flex: 1;
      overflow: auto;
    }
    #compareModal .editor, #compareModal .result {
      flex: 1;
      border: 1px solid #ccc;
      padding: 10px;
      background: #fefefe;
      font-family: Arial, sans-serif;
      overflow: auto;
    }
    #compareModal .editor[contenteditable=true]:focus {
      outline: 2px solid #4a90e2;
    }
    #compareModal .modal-footer {
      padding: 10px;
      border-top: 1px solid #ccc;
      text-align: right;
    }
    .mark-added { background: #c8facc; }
    .mark-removed { background: #ffc8c8; }
    .mark-edited { background: #fff3c4; }
    .mark-partial { background: #cce5ff; }
    .mark-misspelled { background: orange; }
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
    <div class="modal-body" style="flex-direction: row;">
      <div id="leftResult" class="result"></div>
      <div id="rightResult" class="result"></div>
    </div>
  `;
  document.body.appendChild(modal);

  window.compareContent = function() {
    const cleanHTML = (html) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      // remove background colors and highlights
      div.querySelectorAll('*').forEach(el => {
        el.style.background = '';
        el.style.backgroundColor = '';
        el.removeAttribute('style');
      });
      return div.innerHTML.trim();
    };

    const leftHTML = cleanHTML(document.getElementById('leftEditor').innerHTML);
    const rightHTML = cleanHTML(document.getElementById('rightEditor').innerHTML);

    document.getElementById('leftResult').innerHTML = leftHTML;
    document.getElementById('rightResult').innerHTML = rightHTML;

    // You can plug in actual word-by-word diffing next here
    // For now, it's just showing the pasted content with formatting
  };
})();
