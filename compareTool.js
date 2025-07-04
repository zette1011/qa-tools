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
    #compareModal .result{flex:1;border:1px solid #ccc;padding:10px;background:#fff;overflow:auto;font-family:Arial,sans-serif}
    mark.added{background:#c8facc}mark.removed{background:#ffc8c8}mark.edited{background:#fff3c4}mark.partial{background:#cce5ff}mark.misspelled{background:orange}
    .result ul{padding-left:1.4em;margin-left:0}
    .result li{margin-bottom:0.4em;list-style-type:disc}
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
      <div id="leftEditor" class="editor" contenteditable="true"></div>
      <div id="rightEditor" class="editor" contenteditable="true"></div>
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

  function stripHighlights(node) {
    node.querySelectorAll('[style*="background"], span[style], font, u').forEach(n => {
      const clean = document.createElement('span');
      clean.innerHTML = n.innerHTML;
      n.replaceWith(...clean.childNodes);
    });
  }

  function cloneWithStyle(el) {
    const clone = el.cloneNode(true);
    stripHighlights(clone);
    clone.querySelectorAll('mark').forEach(m => m.replaceWith(...m.childNodes));
    return clone;
  }

  function highlightDifferences(el1, el2, resultEl1, resultEl2) {
    const clone1 = cloneWithStyle(el1);
    const clone2 = cloneWithStyle(el2);

    const walker1 = document.createTreeWalker(clone1, NodeFilter.SHOW_TEXT, null);
    const walker2 = document.createTreeWalker(clone2, NodeFilter.SHOW_TEXT, null);

    let node1 = walker1.nextNode();
    let node2 = walker2.nextNode();

    while (node1 || node2) {
      if (!node1 && node2) {
        const mark = document.createElement('mark');
        mark.className = 'added';
        mark.textContent = node2.textContent;
        node2.parentNode.replaceChild(mark, node2);
        node2 = walker2.nextNode();
        continue;
      }
      if (node1 && !node2) {
        const mark = document.createElement('mark');
        mark.className = 'removed';
        mark.textContent = node1.textContent;
        node1.parentNode.replaceChild(mark, node1);
        node1 = walker1.nextNode();
        continue;
      }
      if (node1.textContent !== node2.textContent) {
        const mark1 = document.createElement('mark');
        mark1.className = 'edited';
        mark1.textContent = node1.textContent;
        node1.parentNode.replaceChild(mark1, node1);

        const mark2 = document.createElement('mark');
        mark2.className = 'edited';
        mark2.textContent = node2.textContent;
        node2.parentNode.replaceChild(mark2, node2);
      }
      node1 = walker1.nextNode();
      node2 = walker2.nextNode();
    }

    resultEl1.innerHTML = '';
    resultEl2.innerHTML = '';
    resultEl1.appendChild(clone1);
    resultEl2.appendChild(clone2);
  }

  window.compareContent = function() {
    const left = document.getElementById("leftEditor");
    const right = document.getElementById("rightEditor");
    const leftResult = document.getElementById("leftResult");
    const rightResult = document.getElementById("rightResult");
    highlightDifferences(left, right, leftResult, rightResult);
  };
})();
