// Runs a student's code against the tests, off the main thread. Loaded as a module worker.
// Python runs in Pyodide (served by the app itself, loaded once); JavaScript runs directly.
/* eslint-disable no-restricted-globals */
const PYODIDE = "/pyodide/";
let pyodide = null;

async function getPython() {
  if (!pyodide) {
    const { loadPyodide } = await import(PYODIDE + "pyodide.mjs");
    pyodide = await loadPyodide({ indexURL: PYODIDE });
  }
  return pyodide;
}

const HARNESS = `
import json, copy
def __pillow_run(code, fn, tests_json):
    ns = {}
    try:
        exec(code, ns)
    except Exception as e:
        return json.dumps({"error": f"{type(e).__name__}: {e}"})
    f = ns.get(fn)
    if not callable(f):
        return json.dumps({"error": f"Define a function called {fn}."})
    out = []
    for t in json.loads(tests_json):
        try:
            got = f(*copy.deepcopy(t["args"]))
            json.dumps(got)
            out.append({"ok": True, "got": got})
        except Exception as e:
            out.append({"ok": False, "error": f"{type(e).__name__}: {e}"})
    return json.dumps({"results": out})
__pillow_run(__code, __fn, __tests)
`;

function runJs(code, fn, tests) {
  let f;
  try {
    f = new Function(`${code}\n;return typeof ${fn} === "function" ? ${fn} : undefined;`)();
  } catch (e) {
    return { error: `${e.name}: ${e.message}` };
  }
  if (!f) return { error: `Define a function called ${fn}.` };
  return {
    results: tests.map((t) => {
      try {
        return { ok: true, got: f(...structuredClone(t.args)) };
      } catch (e) {
        return { ok: false, error: `${e.name}: ${e.message}` };
      }
    }),
  };
}

self.onmessage = async (e) => {
  const { id, type, language, code, fn, tests } = e.data;
  try {
    if (type === "warm") {
      if (language === "python") await getPython();
      self.postMessage({ id, ok: true });
      return;
    }
    let out;
    if (language === "javascript") out = runJs(code, fn, tests);
    else {
      const py = await getPython();
      py.globals.set("__code", code);
      py.globals.set("__fn", fn);
      py.globals.set("__tests", JSON.stringify(tests));
      out = JSON.parse(py.runPython(HARNESS));
    }
    self.postMessage({ id, out });
  } catch (err) {
    self.postMessage({ id, out: { error: String((err && err.message) || err) } });
  }
};
