document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('.input-container > textarea');
  const display = document.querySelector('.display');
  if (!input || !display) return;

  const chars = []; // [{ el, timeoutId }]


  input.addEventListener('input', onInput);

  input.addEventListener('blur', () => {
  input.focus();
});

  function onInput() {
    const value = input.value;

    // create/update spans to match input.value
    for (let i = 0; i < value.length; i++) {
      const ch = value[i];
      const existing = chars[i];
      if (existing) {
        if (existing.el.textContent !== ch) {
          clearTimeout(existing.timeoutId);
          existing.el.remove();
          chars.splice(i, 1);
          createCharAt(ch, i);
        }
      } else {
        createCharAt(ch, i);
      }
    }

    // remove extra spans when user backspaces
    while (chars.length > value.length) {
      const obj = chars.pop();
      clearTimeout(obj.timeoutId);
      if (obj.el.parentNode) obj.el.parentNode.removeChild(obj.el);
    }
  }

  function createCharAt(ch, index) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    const ref = display.childNodes[index] || null;
    display.insertBefore(span, ref);

    const timeoutId = setTimeout(() => {
      span.classList.add('smoke');
      span.addEventListener('animationend', () => {
        if (span.parentNode) span.parentNode.removeChild(span);
        // input.value = input.value.slice(0, index) + input.value.slice(index + 1);
        input.value = input.value.slice(1);
      }, { once: true });
    }, 2000);

    chars.splice(index, 0, { el: span, timeoutId });
  }
});