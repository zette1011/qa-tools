(function(){
  if(document.getElementById('compareModal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #compareModal{position:fixed;top:20px;left:20px;right:20px;bottom:20px;z-index:999999;background:#fff;box-shadow:0 0 10px #000;display:flex;flex-direction:column;font-family:Arial,sans-serif}
    #compareModal .modal-header{background:#222;color:#fff;padding:10px;display:flex;justify-content:space-between;align-items:center}
    #compareModal .modal-body{flex:1;display:flex;padding:10px;gap:10px;overflow:auto}
    #compareModal .modal-footer{padding:10px;border-top:1px solid #ccc;text-align:right}
    #compareModal .editor{flex:1;border:1px solid #ccc;padding:10px;background:#fefefe;overflow:auto;font-family:Arial,sans-serif;white-space:pre-wrap}
    #compareModal .editor[contenteditable=true]:focus{outline:2px solid #4a90e2}
    #comparisonResults{margin-top:10px;display:flex;gap:10px;flex:1;height:300px;border-top:1px solid #ccc;padding-top:10px}
    .comparison-box{flex:1;border:1px solid #ccc;padding:10px;overflow:auto;background:#fff;font-family:Arial,sans-serif;white-space:pre-wrap}
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
    <div id="comparisonResults"></div>
  `;
  document.body.appendChild(modal);

  const dictionary = new Set(["the","and","of","to","a","in","for","is","on","that","by","this","with","i","you","it","not","or","be","are","from","at","as","your","all","have","new","more","an","was","we","will","home","can","us","about","if","page","my","has","search","free","but","our","one","other","do","no","information","time","they","site","he","up","may","what","which","their","news","out","use","any","there","see","only","so","his","when","contact","here","business","who","web","also","now","help","get","pm","view","online","first","am","been","would","how","were","me","services","some","these","click","its","like","service","x","than","find"]);

  window.compareContent = function() {
    const cleanHTML = html => html.replace(/<span[^>]*style=["']?background[^>]*?>.*?<\/span>/gi, '').replace(/<[^>]*>/g, '').trim();

    const l = document.getElementById("leftEditor");
    const r = document.getElementById("rightEditor");
    const lLines = cleanHTML(l.innerHTML).split(/\n+/);
    const rLines = cleanHTML(r.innerHTML).split(/\n+/);
    const max = Math.max(lLines.length, rLines.length);

    let lResult = "", rResult = "";

    for (let i = 0; i < max; i++) {
      const lLine = lLines[i] || "";
      const rLine = rLines[i] || "";

      if (!lLine && rLine) {
        lResult += `<br>`;
        rResult += `<mark class="added">${rLine}</mark><br>`;
      } else if (lLine && !rLine) {
        lResult += `<mark class="removed">${lLine}</mark><br>`;
        rResult += `<br>`;
      } else if (lLine !== rLine) {
        let d = 0;
        for (let j = 0; j < Math.min(lLine.length, rLine.length); j++) {
          if (lLine[j] !== rLine[j]) d++;
        }
        let ratio = d / Math.max(lLine.length, rLine.length);
        let cls = ratio < 0.3 ? "partial" : "edited";
        lResult += `<mark class="${cls}">${lLine}</mark><br>`;
        rResult += `<mark class="${cls}">${rLine}</mark><br>`;
      } else {
        lResult += `${lLine}<br>`;
        rResult += `${rLine}<br>`;
      }
    }

    const resultHTML = `
      <div id="comparisonResults">
        <div class="comparison-box">${lResult}</div>
        <div class="comparison-box">${rResult}</div>
      </div>
    `;

    document.getElementById("comparisonResults").innerHTML = resultHTML;
  };
})();
