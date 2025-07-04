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
    h1, ol, ul, li, button { margin: 0; padding: auto;}
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

 window.compareContent = function () {
  const stripStyles = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;

    // Remove spans with internal GUIDs from Google Docs
    div.querySelectorAll('span[id^="docs-internal-guid"]').forEach(el => el.remove());

    // Remove all comment nodes like <!-- x-tinymce/html -->
    const removeComments = (node) => {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.COMMENT_NODE) {
          node.removeChild(child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          removeComments(child);
        }
      }
    };
    removeComments(div);

    // Remove inline styles and background colors
    div.querySelectorAll('*').forEach(el => {
      el.style.background = '';
      el.style.backgroundColor = '';
      el.removeAttribute('style');
    });

    return div.innerHTML.trim();
  };

  const leftText = stripStyles(document.getElementById('leftEditor').innerHTML);
  const rightText = stripStyles(document.getElementById('rightEditor').innerHTML);

  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(leftText, rightText);
  dmp.diff_cleanupSemantic(diffs);

  const highlightDiff = (diffs, isRight = false) => {
    return diffs.map(([op, data]) => {
      if (op === 0) return data;
      if (op === -1) return isRight ? '' : `<span class="mark-removed">${data}</span>`;
      if (op === 1) return isRight ? `<span class="mark-added">${data}</span>` : '';
    }).join('');
  };

  // Only display the highlighted diffs
  document.getElementById('leftResult').innerHTML = highlightDiff(diffs, false);
  document.getElementById('rightResult').innerHTML = highlightDiff(diffs, true);
};

  
// Google diff-match-patch logic (lightweight browser implementation)
function diff_match_patch() {
  this.diff_main = function(text1, text2) {
    if (text1 === text2) return [[0, text1]];
    const commonPrefixLen = this.diff_commonPrefix(text1, text2);
    const commonPrefix = text1.substring(0, commonPrefixLen);
    text1 = text1.substring(commonPrefixLen);
    text2 = text2.substring(commonPrefixLen);

    const commonSuffixLen = this.diff_commonSuffix(text1, text2);
    const commonSuffix = text1.substring(text1.length - commonSuffixLen);
    text1 = text1.substring(0, text1.length - commonSuffixLen);
    text2 = text2.substring(0, text2.length - commonSuffixLen);

    const diffs = this.diff_compute(text1, text2);
    if (commonPrefix) diffs.unshift([0, commonPrefix]);
    if (commonSuffix) diffs.push([0, commonSuffix]);
    return diffs;
  };

  this.diff_compute = function(text1, text2) {
    if (!text1) return [[1, text2]];
    if (!text2) return [[-1, text1]];

    if (text1.length > text2.length) {
      const i = text1.indexOf(text2);
      if (i !== -1) {
        return [[-1, text1.substring(0, i)], [0, text2], [-1, text1.substring(i + text2.length)]];
      }
    } else {
      const i = text2.indexOf(text1);
      if (i !== -1) {
        return [[1, text2.substring(0, i)], [0, text1], [1, text2.substring(i + text1.length)]];
      }
    }

    return [[-1, text1], [1, text2]];
  };

  this.diff_commonPrefix = function(text1, text2) {
    let i = 0;
    while (i < text1.length && i < text2.length && text1[i] === text2[i]) i++;
    return i;
  };

  this.diff_commonSuffix = function(text1, text2) {
    let i = 0;
    while (
      i < text1.length &&
      i < text2.length &&
      text1[text1.length - i - 1] === text2[text2.length - i - 1]
    ) i++;
    return i;
  };

  this.diff_cleanupSemantic = function(diffs) {
    // No-op for this lightweight version
    return;
  };
}

})();
