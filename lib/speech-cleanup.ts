export function cleanSpeechText(input: string) {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const words = normalized.split(" ");
  const compacted: string[] = [];

  for (const word of words) {
    if (compacted.at(-1)?.toLowerCase() !== word.toLowerCase()) {
      compacted.push(word);
    }
  }

  return collapseRepeatedTail(collapseRepeatedSequences(compacted)).join(" ").trim();
}

function collapseRepeatedSequences(words: string[]) {
  const output = [...words];
  let index = 0;

  while (index < output.length) {
    let removed = false;

    for (let size = Math.min(12, Math.floor((output.length - index) / 2)); size >= 2; size -= 1) {
      const left = output.slice(index, index + size);
      const right = output.slice(index + size, index + size * 2);

      if (sameWords(left, right)) {
        output.splice(index + size, size);
        removed = true;
        break;
      }
    }

    if (!removed) {
      index += 1;
    }
  }

  return output;
}

function collapseRepeatedTail(words: string[]) {
  const output = [...words];
  let changed = true;

  while (changed) {
    changed = false;

    for (let size = Math.min(12, Math.floor(output.length / 2)); size >= 2; size -= 1) {
      const left = output.slice(output.length - size * 2, output.length - size);
      const right = output.slice(output.length - size);

      if (sameWords(left, right)) {
        output.splice(output.length - size, size);
        changed = true;
        break;
      }
    }
  }

  return output;
}

function sameWords(left: string[], right: string[]) {
  if (left.length !== right.length || left.length === 0) return false;
  return left.every((word, index) => word.toLowerCase() === right[index]?.toLowerCase());
}
