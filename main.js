var py_div;
var Range = ace.require("ace/range").Range;

//function to run the python code
async function run_python(py_code, codeResultDivId) {
  //reference to the output div
  const currentCodeResultDiv = document.getElementById(
    `codeResultDiv-${codeResultDivId}`
  );
  py_code = String(py_code);
  // remove the previous script tag
  if (py_div) {
    py_div.remove();
  }
  // Wrap the Python code (py_code) with a PyScript tag
  let html_tag = `
  <py-script id="py-${codeResultDivId}" output="${currentCodeResultDiv.id}">
  ${py_code}
  </py-script>
  `;

  // Create the DIV to attach the py-script tag
  const div = document.createElement("div");
  div.innerHTML = html_tag;
  py_div = div.firstElementChild;
  //Add the PyScript code to the output div
  currentCodeResultDiv.appendChild(py_div);
  try {
    //check for type() function error
    if (py_code.includes("type(")) {
      alert(
        'Az oldalon található Pyscript keretrendszer jelenlegi állapota nem jeleníti meg a type() function visszatérési értékét. A függvény a W3Schools oldalán kipróbálható, amelyhez az oldal alján megtalálható a közvetlen link a "W3SCHOOLS REPL KIPRÓBÁLÁSA" rész alatt.'
      );
    }
    // This will run the Python interpreter
    // for the code loaded into py_div
    // py_div.evaluate() will run the code within the <py-script> tag
    await py_div.evaluate();
  } catch (error) {
    console.error("Python error:");
    console.error(error);
  }
}

//select all containers with python code
const pythonCodeContainers = document.querySelectorAll(
  "pre.language-python.line-numbers"
);

var currentId = 0;
//loop through all pythonCodeContainers
for (const el of pythonCodeContainers) {
  //create a new container div for all new content
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("containerDiv");
  //create a new container div for the ace editor
  const editorContainerDiv = document.createElement("div");
  containerDiv.appendChild(editorContainerDiv);

  //Get the default code from the current element
  const currentCode = el.querySelector("code").innerText;

  //Create a hidden div container where the current code will be stored.
  //When we reset the code the program will read the necessary/default code from the hiddenCodeContainer
  const hiddenCodeContainer = document.createElement("div");
  hiddenCodeContainer.setAttribute("id", `hiddenCodeContainer-${currentId}`);
  hiddenCodeContainer.innerHTML = currentCode;
  containerDiv.appendChild(hiddenCodeContainer);

  //Create a new div container where the python code result will be displayed
  const codeResultDiv = document.createElement("div");
  codeResultDiv.setAttribute("id", `codeResultDiv-${currentId}`);

  //Create the div for the editor
  const currentEditor = document.createElement("div");
  //Give the editor a unique id
  currentEditor.setAttribute("id", `editor-${currentId}`);

  //create the ace editor with cobalt theme, python mode and max 26 lines
  const editor = ace.edit(currentEditor, {
    theme: "ace/theme/cobalt",
    mode: "ace/mode/python",
    maxLines: 26,
  });
  //Give the editor the default python code
  editor.setValue(currentCode);
  editor.selection.setRange(new Range(0, 0, 0, 0));
  editorContainerDiv.appendChild(currentEditor);

  //Create a button to run the python code
  const runButton = document.createElement("button");
  runButton.classList.add("button-3d-effect", "runButton");
  runButton.innerText = "Run";

  //Store the current code result div id for the run button
  const currentcodeResultDivId = currentId;
  //Listen to the click event, and run the python code when the button is clicked
  runButton.addEventListener("click", async () => {
    codeResultDiv.innerHTML = "";
    let editor = ace.edit(currentEditor);
    //Remove selection highlighting
    editor.selection.setRange(new Range(0, 0, 0, 0));
    //Get the current python code from the editor
    var code = editor.getValue();
    //Run the python code with the currentcodeResultDivId
    await run_python(code, currentcodeResultDivId);
    const ul = document.querySelector(
      `#codeResultDiv-${currentcodeResultDivId}`
    );
    if (ul.innerText.includes('File "",')) {
      const errorIndex = ul.innerText.indexOf('File "",');
      const line = ul.innerText.slice(errorIndex + 14);
      if (line.indexOf(" ") == 1) {
        //1-9 lines
        const errorLineNumber = Number(line.slice(0, 1)) - 1;

        editor.selection.setRange(
          new Range(errorLineNumber, 0, errorLineNumber, 100)
        );
      } else {
        //More than 9 lines

        const errorLineNumber = Number(line.slice(0, line.indexOf(","))) - 1;
        editor.selection.setRange(
          new Range(errorLineNumber, 0, errorLineNumber, 100)
        );
      }
    }
  });
  //Create a button to reset the python code in the ace editor
  const resetButton = document.createElement("button");
  resetButton.classList.add("button-3d-effect", "resetButton");
  resetButton.innerText = "Reset";
  //Listen to the click event, and reset the python code when the button is clicked
  resetButton.addEventListener("click", () => {
    let editor = ace.edit(currentEditor);
    if (hiddenCodeContainer.innerHTML) {
      editor.setValue(hiddenCodeContainer.innerHTML);
    } else {
      editor.setValue("");
    }
    codeResultDiv.innerHTML = "";
    editor.selection.setRange(new Range(0, 0, 0, 0));
  });
  containerDiv.appendChild(runButton);
  containerDiv.appendChild(resetButton);
  containerDiv.appendChild(codeResultDiv);
  //replace the current pythonCodeContainer with the new containerDiv
  el.replaceWith(containerDiv);
  currentId++;
}

//Remove default python code solutions from the dom
const articleContainer = document.querySelector(
  "article.markdown-body.line-numbers"
);
const defaultCodeSolutions = articleContainer.querySelectorAll(
  "pre:not(.language-python):not(.line-numbers)"
);
for (const element of defaultCodeSolutions) {
  if (element.childNodes.length == 1) {
    element.childNodes[0].innerHTML = "";
  }
}
articleContainer.insertAdjacentHTML(
  "beforeend",
  `<div style="background-color:red;padding:8px;">
  <h3>W3SCHOOLS REPL KIPRÓBÁLÁSA</h3>
  <p>Ha hibás működést találtál az oldalon található Pyscript keretrendszerben, akkor ellenőrizd le a Python kódod megoldását a W3Schools oldalán.</p>
  <h4>Ismert hibák:</h4>
  <ul>
    <li>type() function</li>
  </ul>
  <div style="margin-top:40px;margin-bottom:30px;padding-bottom:30px">
  <a href="https://www.w3schools.com/python/trypython.asp?filename=demo_type" target="_blank" class="w3scoolsLink">W3Schools REPL</a>
  </div>
  </div>`
);
