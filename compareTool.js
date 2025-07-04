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
    div.querySelectorAll('[style*="background"], span[style*="background-color"], mark').forEach(el => el.replaceWith(...el.childNodes));
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

  function tokenize(text) {
    return text.split(/(\b|\s+)/).filter(t => t.length > 0);
  }

  function createDiffHTML(tokens1, tokens2, cls) {
    const len = Math.max(tokens1.length, tokens2.length);
    let html1 = '', html2 = '';
    for (let i = 0; i < len; i++) {
      const t1 = tokens1[i] || '';
      const t2 = tokens2[i] || '';
      if (t1 === t2) {
        html1 += t1;
        html2 += t2;
      } else {
        html1 += `<mark class="${cls}">${t1}</mark>`;
        html2 += `<mark class="${cls}">${t2}</mark>`;
      }
    }
    return [html1, html2];
  }

  function compareHTML(leftHTML, rightHTML) {
    const lDiv = document.createElement('div');
    const rDiv = document.createElement('div');
    lDiv.innerHTML = leftHTML;
    rDiv.innerHTML = rightHTML;

    const lText = lDiv.innerText.trim().split(/\n+/);
    const rText = rDiv.innerText.trim().split(/\n+/);

    const max = Math.max(lText.length, rText.length);
    let leftResult = '', rightResult = '';

    for (let i = 0; i < max; i++) {
      const line1 = lText[i] || '';
      const line2 = rText[i] || '';
      if (line1 === line2) {
        leftResult += line1 + '<br>';
        rightResult += line2 + '<br>';
      } else if (!line1 && line2) {
        rightResult += `<mark class="added">${line2}</mark><br>`;
        leftResult += '<br>';
      } else if (line1 && !line2) {
        leftResult += `<mark class="removed">${line1}</mark><br>`;
        rightResult += '<br>';
      } else {
        const [diffL, diffR] = createDiffHTML(tokenize(line1), tokenize(line2), 'edited');
        leftResult += diffL + '<br>';
        rightResult += diffR + '<br>';
      }
    }
    return [leftResult, rightResult];
  }

  window.compareContent = function() {
    const l = document.getElementById("leftEditor");
    const r = document.getElementById("rightEditor");
    const lHTML = stripHighlights(l.innerHTML);
    const rHTML = stripHighlights(r.innerHTML);
    const [leftDiff, rightDiff] = compareHTML(lHTML, rHTML);
    document.getElementById("leftResult").innerHTML = leftDiff;
    document.getElementById("rightResult").innerHTML = rightDiff;
    syncScroll(
      document.getElementById("leftResult"),
      document.getElementById("rightResult")
    );
  };
})();
