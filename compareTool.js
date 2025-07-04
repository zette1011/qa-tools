(function(){
  if(document.getElementById('compareModal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #compareModal{position:fixed;top:20px;left:20px;right:20px;bottom:20px;z-index:999999;background:#fff;box-shadow:0 0 10px #000;display:flex;flex-direction:column;font-family:Arial,sans-serif}
    #compareModal .modal-header{background:#222;color:#fff;padding:10px;display:flex;justify-content:space-between;align-items:center}
    #compareModal .modal-body{flex:1;display:flex;flex-direction:column;padding:10px;gap:10px;overflow:hidden}
    #compareModal .editors{flex:1;display:flex;gap:10px;overflow:auto}
    #compareModal .editor{flex:1;border:1px solid #ccc;padding:10px;background:#fefefe;overflow:auto;font-family:Arial,sans-serif;white-space:normal;line-height:1.6}
    #compareModal .editor[contenteditable=true]:focus{outline:2px solid #4a90e2}
    #compareModal .modal-footer{padding:10px;border-top:1px solid #ccc;text-align:right}
    #comparisonResults{display:flex;gap:10px;height:100%;flex:1;overflow:auto}
    .comparison-box{flex:1;border:1px solid #ccc;padding:10px;background:#fff;overflow:auto;font-family:Arial,sans-serif;white-space:normal;line-height:1.6;height:100%}
    mark.added{background:#c8facc}mark.removed{background:#ffc8c8}mark.edited{background:#fff3c4}mark.partial{background:#cce5ff}mark.misspelled{background:orange}
    ul, ol { margin-left: 1.5em; }
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
      <div class="editors">
        <div id="leftEditor" class="editor" contenteditable="true" placeholder="Paste Google Docs content here"></div>
        <div id="rightEditor" class="editor" contenteditable="true" placeholder="Paste Website content here"></div>
      </div>
      <div class="modal-footer">
        <button onclick="compareContent()">🔍 Compare</button>
      </div>
      <div id="comparisonResults">
        <div id="leftResult" class="comparison-box"></div>
        <div id="rightResult" class="comparison-box"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  function stripStyles(el) {
    el.querySelectorAll('[style], mark').forEach(e => e.replaceWith(...e.childNodes));
  }

  function tokenizeWords(str) {
    return str.split(/(\s+|\b)/).filter(Boolean);
  }

  function diffWords(w1, w2) {
    const len = Math.max(w1.length, w2.length);
    let result1 = '', result2 = '';
    for (let i = 0; i < len; i++) {
      const a = w1[i] || '', b = w2[i] || '';
      if (a === b) {
        result1 += a;
        result2 += b;
      } else {
        result1 += `<mark class="edited">${a}</mark>`;
        result2 += `<mark class="edited">${b}</mark>`;
      }
    }
    return [result1, result2];
  }

  function diffElements(el1, el2) {
    const leftChildren = el1.childNodes;
    const rightChildren = el2.childNodes;
    const max = Math.max(leftChildren.length, rightChildren.length);

    for (let i = 0; i < max; i++) {
      const l = leftChildren[i];
      const r = rightChildren[i];

      if (!l && r) {
        el2.replaceChild(wrapAll(r, 'added'), r);
        continue;
      }
      if (l && !r) {
        el1.replaceChild(wrapAll(l, 'removed'), l);
        continue;
      }

      if (l.nodeType === 3 && r.nodeType === 3) {
        const [w1, w2] = diffWords(tokenizeWords(l.textContent), tokenizeWords(r.textContent));
        const spanL = document.createElement('span');
        const spanR = document.createElement('span');
        spanL.innerHTML = w1;
        spanR.innerHTML = w2;
        el1.replaceChild(spanL, l);
        el2.replaceChild(spanR, r);
      }
      else if (l.nodeType === 1 && r.nodeType === 1 && l.tagName === r.tagName) {
        diffElements(l, r);
      }
      else {
        el1.replaceChild(wrapAll(l, 'edited'), l);
        el2.replaceChild(wrapAll(r, 'edited'), r);
      }
    }
  }

  function wrapAll(node, cls) {
    const span = document.createElement('mark');
    span.className = cls;
    span.appendChild(node.cloneNode(true));
    return span;
  }

  window.compareContent = function() {
    const lHTML = document.getElementById('leftEditor').innerHTML;
    const rHTML = document.getElementById('rightEditor').innerHTML;

    const lDiv = document.createElement('div');
    const rDiv = document.createElement('div');
    lDiv.innerHTML = lHTML;
    rDiv.innerHTML = rHTML;

    stripStyles(lDiv);
    stripStyles(rDiv);

    diffElements(lDiv, rDiv);

    document.getElementById('leftResult').innerHTML = '';
    document.getElementById('rightResult').innerHTML = '';
    document.getElementById('leftResult').appendChild(lDiv);
    document.getElementById('rightResult').appendChild(rDiv);
  };
})();
