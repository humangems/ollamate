import { describe, it, expect } from 'vitest';
import { extractReasoning } from './reasoningHelper';

describe('extractReasoning', () => {
  it('returns empty reasoning when there is no <think> block', () => {
    const [reasoning, content] = extractReasoning('Just a plain answer.');
    expect(reasoning).toBe('');
    expect(content).toBe('Just a plain answer.');
  });

  it('extracts a complete <think> block and returns the trailing content', () => {
    const [reasoning, content] = extractReasoning(
      '<think>I should greet them</think>Hello!',
    );
    expect(reasoning).toBe('I should greet them');
    expect(content).toBe('Hello!');
  });

  it('trims whitespace around the <think> block', () => {
    const [reasoning, content] = extractReasoning(
      '<think>\n  deliberating\n</think>\n\nfinal answer',
    );
    expect(reasoning).toBe('deliberating');
    expect(content).toBe('final answer');
  });

  it('handles a still-streaming <think> block with no closing tag', () => {
    const [reasoning, content] = extractReasoning('<think>mid-thought');
    expect(reasoning).toBe('mid-thought');
    expect(content).toBe('');
  });

  it('returns empty content when reasoning block is closed but no text follows', () => {
    const [reasoning, content] = extractReasoning('<think>done thinking</think>');
    expect(reasoning).toBe('done thinking');
    expect(content).toBe('');
  });

  it('preserves markdown / multi-line content after the block', () => {
    const [reasoning, content] = extractReasoning(
      '<think>plan it out</think># Heading\n\n- a\n- b',
    );
    expect(reasoning).toBe('plan it out');
    expect(content).toBe('# Heading\n\n- a\n- b');
  });
});
