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

  function stripHighlights(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('[style*="background"], span[style*="background-color"]').forEach(el => el.style.background = '');
    return div.innerHTML;
  }

  function syncScroll(leftBox, rightBox) {
    leftBox.addEventListener('scroll', () => {
      rightBox.scrollTop = leftBox.scrollTop;
      rightBox.scrollLeft = leftBox.scrollLeft;
    });
    rightBox.addEventListener('scroll', () => {
      leftBox.scrollTop = rightBox.scrollTop;
      leftBox.scrollLeft = rightBox.scrollLeft;
    });
  }

  function diffTextNodes(originalNode, compareNode) {
    const walker1 = document.createTreeWalker(originalNode, NodeFilter.SHOW_TEXT);
    const walker2 = document.createTreeWalker(compareNode, NodeFilter.SHOW_TEXT);

    let textNode1 = walker1.nextNode();
    let textNode2 = walker2.nextNode();

    while (textNode1 || textNode2) {
      const text1 = textNode1 ? textNode1.nodeValue.trim() : '';
      const text2 = textNode2 ? textNode2.nodeValue.trim() : '';

      const words1 = text1.split(/(\s+)/);
      const words2 = text2.split(/(\s+)/);
      const max = Math.max(words1.length, words2.length);

      const span1 = document.createElement('span');
      const span2 = document.createElement('span');

      for (let i = 0; i < max; i++) {
        const w1 = words1[i] || '';
        const w2 = words2[i] || '';

        const el1 = document.createElement('span');
        const el2 = document.createElement('span');

        if (w1 === w2) {
          el1.textContent = w1;
          el2.textContent = w2;
        } else {
          if (w1 && !w2) {
            el1.innerHTML = `<mark class="removed">${w1}</mark>`;
          } else if (!w1 && w2) {
            el2.innerHTML = `<mark class="added">${w2}</mark>`;
          } else {
            el1.innerHTML = `<mark class="edited">${w1}</mark>`;
            el2.innerHTML = `<mark class="edited">${w2}</mark>`;
          }
        }

        span1.appendChild(el1);
        span2.appendChild(el2);
      }

      if (textNode1) textNode1.replaceWith(span1);
      if (textNode2) textNode2.replaceWith(span2);

      textNode1 = walker1.nextNode();
      textNode2 = walker2.nextNode();
    }
  }

  window.compareContent = function() {
    const l = document.getElementById("leftEditor");
    const r = document.getElementById("rightEditor");
    const lHTML = stripHighlights(l.innerHTML);
    const rHTML = stripHighlights(r.innerHTML);

    const lContainer = document.createElement('div');
    const rContainer = document.createElement('div');
    lContainer.innerHTML = lHTML;
    rContainer.innerHTML = rHTML;

    diffTextNodes(lContainer, rContainer);

    document.getElementById("leftResult").innerHTML = lContainer.innerHTML;
    document.getElementById("rightResult").innerHTML = rContainer.innerHTML;

    syncScroll(
      document.getElementById("leftResult"),
      document.getElementById("rightResult")
    );
  };
})();
