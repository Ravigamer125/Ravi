(function () {
  "use strict";

  const expressionEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");
  const keysEl = document.getElementById("keys");

  /**
   * Internal state
   */
  let input = ""; // raw display input like "12+3×4"
  let lastResult = null; // last computed result number

  function updateDisplay() {
    expressionEl.textContent = input || "0";
    const maybe = safeEvaluate(input);
    if (maybe.status === "ok" && maybe.value !== null && input) {
      resultEl.textContent = "= " + formatNumber(maybe.value);
    } else {
      resultEl.textContent = "";
    }
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "Error";
    const asStr = value.toString();
    if (!asStr.includes("e") && asStr.includes(".")) {
      return Number(value.toFixed(10)).toString();
    }
    return asStr;
  }

  function toJsExpression(expr) {
    if (!expr) return "";
    return expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/%/g, "/100");
  }

  function safeEvaluate(expr) {
    try {
      if (!expr) return { status: "empty", value: null };
      const transformed = toJsExpression(expr);
      // Avoid evaluating invalid trailing operators
      if (/[*+\-\/%]$/.test(transformed)) return { status: "incomplete", value: null };
      // Disallow any unexpected characters
      if (!/^[-+*/().%\d\s]+$/.test(transformed)) return { status: "invalid", value: null };
      // Evaluate using Function to avoid access to scope
      const value = Function("return (" + transformed + ")")();
      if (typeof value !== "number" || Number.isNaN(value)) {
        return { status: "invalid", value: null };
      }
      return { status: "ok", value };
    } catch (_) {
      return { status: "error", value: null };
    }
  }

  function isOperator(char) {
    return char === "+" || char === "-" || char === "×" || char === "÷" || char === "%";
  }

  function append(value) {
    if (value === ".") {
      // Prevent multiple decimals in the current number segment
      const lastNumber = input.split(/[+\-×÷%]/).pop();
      if (lastNumber.includes(".")) return;
    }

    if (isOperator(value)) {
      if (input === "" && value !== "-") return; // only allow unary minus at start
      if (input && isOperator(input[input.length - 1])) {
        // Replace the last operator (except allow switching +/-)
        input = input.slice(0, -1) + value;
        updateDisplay();
        return;
      }
    }

    input += value;
    updateDisplay();
  }

  function backspace() {
    input = input.slice(0, -1);
    updateDisplay();
  }

  function clearAll() {
    input = "";
    lastResult = null;
    updateDisplay();
  }

  function equals() {
    const res = safeEvaluate(input);
    if (res.status === "ok") {
      lastResult = res.value;
      input = formatNumber(res.value);
      updateDisplay();
    }
  }

  keysEl.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("key")) return;

    const action = target.getAttribute("data-action");
    const value = target.getAttribute("data-value");

    if (action === "clear") return clearAll();
    if (action === "backspace") return backspace();
    if (action === "equals") return equals();
    if (value) return append(value);
  });

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    const { key } = e;
    if (/^\d$/.test(key)) return append(key);
    if (key === ".") return append(".");
    if (key === "+") return append("+");
    if (key === "-") return append("-");
    if (key === "*") return append("×");
    if (key === "/") return append("÷");
    if (key === "%") return append("%");
    if (key === "Enter" || key === "=") return equals();
    if (key === "Backspace") return backspace();
    if (key.toLowerCase() === "c") return clearAll();
  });

  updateDisplay();
})();
