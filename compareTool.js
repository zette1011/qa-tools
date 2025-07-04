
(function(){
  if(document.getElementById('compareModal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #compareModal{position:fixed;top:20px;left:20px;right:20px;bottom:20px;z-index:999999;background:#fff;box-shadow:0 0 10px #000;display:flex;flex-direction:column;font-family:sans-serif}
    #compareModal .modal-header{background:#222;color:#fff;padding:10px;display:flex;justify-content:space-between;align-items:center}
    #compareModal .modal-body{flex:1;display:flex;padding:10px;gap:10px;overflow:auto}
    #compareModal .modal-footer{padding:10px;border-top:1px solid #ccc;text-align:right}
    #compareModal .editor{flex:1;border:1px solid #ccc;padding:10px;background:#fefefe;overflow:auto}
    #compareModal .editor[contenteditable=true]:focus{outline:2px solid #4a90e2}
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
  `;
  document.body.appendChild(modal);

  const dictionary = new Set(["the","and","of","to","a","in","for","is","on","that","by","this","with","i","you","it","not","or","be","are","from","at","as","your","all","have","new","more","an","was","we","will","home","can","us","about","if","page","my","has","search","free","but","our","one","other","do","no","information","time","they","site","he","up","may","what","which","their","news","out","use","any","there","see","only","so","his","when","contact","here","business","who","web","also","now","help","get","pm","view","online","first","am","been","would","how","were","me","services","some","these","click","its","like","service","x","than","find"]);

  window.compareContent = function() {
    const l = document.getElementById("leftEditor");
    const r = document.getElementById("rightEditor");
    const lLines = l.innerHTML.split(/<br\s*\/?>|\n/);
    const rLines = r.innerHTML.split(/<br\s*\/?>|\n/);
    const max = Math.max(lLines.length, rLines.length);
    const clean = t => t.replace(/<[^>]*>/g, "").trim();

    let lResult = "", rResult = "";
    for (let i = 0; i < max; i++) {
      const lRaw = lLines[i] || "", rRaw = rLines[i] || "";
      const lClean = clean(lRaw), rClean = clean(rRaw);
      if (!lClean && rClean) {
        lResult += `<br>`;
        rResult += `<mark class="added">${rRaw}</mark><br>`;
      } else if (lClean && !rClean) {
        lResult += `<mark class="removed">${lRaw}</mark><br>`;
        rResult += `<br>`;
      } else if (lClean !== rClean) {
        let d = 0;
        for (let j = 0; j < Math.min(lClean.length, rClean.length); j++) {
          if (lClean[j] !== rClean[j]) d++;
        }
        let ratio = d / Math.max(lClean.length, rClean.length);
        let cls = ratio < 0.3 ? "partial" : "edited";
        lResult += `<mark class="${cls}">${lRaw}</mark><br>`;
        rResult += `<mark class="${cls}">${rRaw}</mark><br>`;
      } else {
        lResult += `${lRaw}<br>`;
        rResult += `${rRaw}<br>`;
      }
    }
    l.innerHTML = lResult;
    r.innerHTML = rResult;

    [l, r].forEach(el => {
      [...el.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const words = n.textContent.split(/(\b)/);
          const html = words.map(w =>
            /^[a-zA-Z]{3,}$/.test(w) && !dictionary.has(w.toLowerCase()) ?
            `<mark class="misspelled">${w}</mark>` : w).join("");
          const span = document.createElement("span");
          span.innerHTML = html;
          n.replaceWith(span);
        }
      });
    });
  };
})();
