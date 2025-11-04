export interface Term {
  id: string;
  coefficient: number;
  variable: string | null;
  isSelected: boolean;
  isConstant: boolean;
}

export interface TermGroup {
  id: string;
  terms: Term[];
  isSelected: boolean;
  isExpanded: boolean;
}

export interface EquationSide {
  terms: (Term | TermGroup)[];
}

export interface Equation {
  left: EquationSide;
  right: EquationSide;
  id: string;
}

export interface Operation {
  type: 'add' | 'subtract' | 'multiply' | 'divide';
  value: string;
  side: 'both' | 'left' | 'right';
  description: string;
}

// Type guards
export function isTerm(item: Term | TermGroup): item is Term {
  return 'coefficient' in item && 'variable' in item;
}

export function isTermGroup(item: Term | TermGroup): item is TermGroup {
  return 'terms' in item && 'isExpanded' in item;
}

// Helper functions
export function getTermCoefficient(term: Term): number {
  return term.coefficient;
}

export function getTermVariable(term: Term): string | null {
  return term.variable;
}

export function getTermIsConstant(term: Term): boolean {
  return term.isConstant;
}

// Helper function to create a term group
export function createTermGroup(terms: Term[]): TermGroup {
  return {
    id: Math.random().toString(36).slice(2, 11),
    terms,
    isSelected: false,
    isExpanded: true
  };
}

export interface EquationHistoryStep {
  equation: Equation;
  operation: Operation | null;
  description: string;
}

export interface DragState {
  isDragging: boolean;
  draggedTerms: Term[];
  sourceSide: 'left' | 'right' | null;
  targetSide: 'left' | 'right' | null;
}

export interface VisualSettings {
  viewMode: 'single' | 'cloud';
  colors: {
    [variable: string]: string;
  };
  showOperationFeedback: boolean;
}