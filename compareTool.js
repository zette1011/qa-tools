(function(){
  if(document.getElementById('compareModal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #compareModal{position:fixed;top:20px;left:20px;right:20px;bottom:20px;z-index:999999;background:#fff;box-shadow:0 0 10px #000;display:flex;flex-direction:column;font-family:Arial,sans-serif}
    #compareModal .modal-header{background:#222;color:#fff;padding:10px;display:flex;justify-content:space-between;align-items:center}
    #compareModal .modal-body{flex:1;display:flex;flex-direction:column;padding:10px;gap:10px;overflow:hidden}
    #compareModal .editors{flex:1;display:flex;gap:10px;overflow:auto}
    #compareModal .editor{flex:1;border:1px solid #ccc;padding:10px;background:#fefefe;overflow:auto;font-family:Arial,sans-serif;white-space:pre-wrap}
    #compareModal .editor[contenteditable=true]:focus{outline:2px solid #4a90e2}
    #compareModal .modal-footer{padding:10px;border-top:1px solid #ccc;text-align:right}
    #comparisonResults{display:flex;gap:10px;height:100%;flex:1;overflow:auto}
    .comparison-box{flex:1;border:1px solid #ccc;padding:10px;background:#fff;overflow:auto;font-family:Arial,sans-serif;white-space:pre-wrap;height:100%}
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

  const dictionary = new Set(["the","and","of","to","a","in","for","is","on","that","by","this","with","i","you","it","not","or","be","are","from","at","as","your","all","have","new","more","an","was","we","will","home","can","us","about","if","page","my","has","search","free","but","our","one","other","do","no","information","time","they","site","he","up","may","what","which","their","news","out","use","any","there","see","only","so","his","when","contact","here","business","who","web","also","now","help","get","pm","view","online","first","am","been","would","how","were","me","services","some","these","click","its","like","service","x","than","find"]);

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

  window.compareContent = function() {
    const l = document.getElementById("leftEditor");
    const r = document.getElementById("rightEditor");
    const lHTML = stripHighlights(l.innerHTML);
    const rHTML = stripHighlights(r.innerHTML);

    const lLines = lHTML.split(/<div>|<br\s*\/?>|\n/).map(x => x.trim()).filter(Boolean);
    const rLines = rHTML.split(/<div>|<br\s*\/?>|\n/).map(x => x.trim()).filter(Boolean);
    const max = Math.max(lLines.length, rLines.length);

    let lResult = "", rResult = "";

    for (let i = 0; i < max; i++) {
      const lLine = lLines[i] || "";
      const rLine = rLines[i] || "";

      if (!lLine && rLine) {
        lResult += `<div></div>`;
        rResult += `<div><mark class="added">${rLine}</mark></div>`;
      } else if (lLine && !rLine) {
        lResult += `<div><mark class="removed">${lLine}</mark></div>`;
        rResult += `<div></div>`;
      } else if (lLine !== rLine) {
        let d = 0;
        for (let j = 0; j < Math.min(lLine.length, rLine.length); j++) {
          if (lLine[j] !== rLine[j]) d++;
        }
        let ratio = d / Math.max(lLine.length, rLine.length);
        let cls = ratio < 0.3 ? "partial" : "edited";
        lResult += `<div><mark class="${cls}">${lLine}</mark></div>`;
        rResult += `<div><mark class="${cls}">${rLine}</mark></div>`;
      } else {
        lResult += `<div>${lLine}</div>`;
        rResult += `<div>${rLine}</div>`;
      }
    }

    document.getElementById("leftResult").innerHTML = lResult;
    document.getElementById("rightResult").innerHTML = rResult;

    syncScroll(
      document.getElementById("leftResult"),
      document.getElementById("rightResult")
    );
  };
})();
