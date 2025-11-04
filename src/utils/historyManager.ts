import type { Equation, EquationHistoryStep } from '../types/equation';

export class HistoryManager {
  private history: EquationHistoryStep[] = [];
  private currentIndex: number = -1;
  private readonly maxHistorySize: number = 5;

  addStep(equation: Equation, operation: EquationHistoryStep['operation'], description: string): void {
    // Remove any future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new step
    this.history.push({
      equation: this.cloneEquation(equation),
      operation,
      description
    });

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex = this.history.length - 1;
    }
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  undo(): EquationHistoryStep | null {
    if (!this.canUndo()) {
      return null;
    }

    this.currentIndex--;
    return this.history[this.currentIndex];
  }

  redo(): EquationHistoryStep | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  getCurrentStep(): EquationHistoryStep | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    return this.history[this.currentIndex];
  }

  getHistory(): EquationHistoryStep[] {
    return this.history.slice(0, this.currentIndex + 1);
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  private cloneEquation(equation: Equation): Equation {
    return {
      ...equation,
      left: {
        terms: equation.left.terms.map(term => ({ ...term }))
      },
      right: {
        terms: equation.right.terms.map(term => ({ ...term }))
      }
    };
  }
}