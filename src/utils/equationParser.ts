import type { Term, TermGroup, Equation, EquationSide, Operation } from '../types/equation';
import { isTerm, isTermGroup } from '../types/equation';

export class EquationParser {
  static parseEquation(input: string): Equation {
    const sides = input.split('=');
    if (sides.length !== 2) {
      throw new Error('Equation must contain exactly one equals sign');
    }

    return {
      left: this.parseSide(sides[0].trim()),
      right: this.parseSide(sides[1].trim()),
      id: Date.now().toString()
    };
  }

  private static parseSide(side: string): EquationSide {
    const terms: Term[] = [];
    const termStrings = side.split(/(?=[+-])/).filter(str => str.trim() !== '');
    
    for (const termStr of termStrings) {
      terms.push(this.parseTerm(termStr.trim()));
    }

    // If no terms were found, add a zero constant
    if (terms.length === 0) {
      terms.push(this.createTerm(0, null));
    }

    return { terms };
  }

  private static parseTerm(termStr: string): Term {
    // Handle the case where term starts with + or -
    let sign = 1;
    let cleanStr = termStr;
    
    if (termStr.startsWith('+')) {
      cleanStr = termStr.substring(1);
    } else if (termStr.startsWith('-')) {
      sign = -1;
      cleanStr = termStr.substring(1);
    }

    // Check if it's a constant
    if (!isNaN(Number(cleanStr))) {
      return this.createTerm(sign * Number(cleanStr), null);
    }

    // Parse variable terms
    const match = cleanStr.match(/^([\d.]*)([a-zA-Z]+)$/);
    if (match) {
      const [, coeffStr, variable] = match;
      const coefficient = coeffStr ? sign * Number(coeffStr) : sign;
      return this.createTerm(coefficient, variable);
    }

    // If we can't parse it properly, treat as a variable with coefficient 1
    return this.createTerm(sign, cleanStr);
  }

  private static createTerm(coefficient: number, variable: string | null): Term {
    return {
      id: Math.random().toString(36).slice(2, 11), // Fixed deprecated substr
      coefficient,
      variable,
      isSelected: false,
      isConstant: variable === null
    };
  }

  static equationToString(equation: Equation): string {
    const leftStr = this.sideToString(equation.left);
    const rightStr = this.sideToString(equation.right);
    return `${leftStr} = ${rightStr}`;
  }

  private static sideToString(side: EquationSide): string {
    if (side.terms.length === 0) return '0';
    
    return side.terms.map((item, index) => {
      let termStr = '';
      
      if (isTerm(item)) {
        // Handle sign
        if (index === 0) {
          if (item.coefficient < 0) termStr += '-';
        } else {
          termStr += item.coefficient >= 0 ? ' + ' : ' - ';
        }

        // Handle coefficient and variable
        const absCoefficient = Math.abs(item.coefficient);
        
        if (item.isConstant) {
          termStr += absCoefficient.toString();
        } else {
          if (absCoefficient === 1) {
            termStr += item.variable;
          } else {
            termStr += `${absCoefficient}${item.variable}`;
          }
        }
      } else if (isTermGroup(item)) {
        // Handle term groups (parentheses)
        if (index === 0) {
          termStr += '(';
        } else {
          termStr += ' + (';
        }
        
        termStr += this.sideToString({ terms: item.terms });
        termStr += ')';
      }

      return termStr;
    }).join('');
  }

  static applyOperation(equation: Equation, operation: Operation): Equation {
    const newEquation = this.cloneEquation(equation);
    
    const sidesToApply: ('left' | 'right')[] = operation.side === 'both' ? ['left', 'right'] : [operation.side];
    
    for (const side of sidesToApply) {
      const parsedTerm = this.parseTerm(operation.value);
      
      switch (operation.type) {
        case 'add':
          newEquation[side].terms.push(parsedTerm);
          break;
        case 'subtract':
          const subtractTerm = { ...parsedTerm, coefficient: -parsedTerm.coefficient };
          newEquation[side].terms.push(subtractTerm);
          break;
        case 'multiply':
          newEquation[side].terms = newEquation[side].terms.map(item => {
            if (isTerm(item)) {
              return {
                ...item,
                coefficient: item.coefficient * parsedTerm.coefficient
              };
            } else if (isTermGroup(item)) {
              return {
                ...item,
                terms: item.terms.map(term => ({
                  ...term,
                  coefficient: term.coefficient * parsedTerm.coefficient
                }))
              };
            }
            return item;
          });
          break;
        case 'divide':
          if (parsedTerm.coefficient === 0) {
            throw new Error('Cannot divide by zero');
          }
          newEquation[side].terms = newEquation[side].terms.map(item => {
            if (isTerm(item)) {
              return {
                ...item,
                coefficient: item.coefficient / parsedTerm.coefficient
              };
            } else if (isTermGroup(item)) {
              return {
                ...item,
                terms: item.terms.map(term => ({
                  ...term,
                  coefficient: term.coefficient / parsedTerm.coefficient
                }))
              };
            }
            return item;
          });
          break;
      }
    }

    return newEquation;
  }

  static moveTerms(equation: Equation, termIds: string[], fromSide: 'left' | 'right', toSide: 'left' | 'right'): Equation {
    const newEquation = this.cloneEquation(equation);
    
    // Find terms to move (only individual terms, not groups)
    const termsToMove: Term[] = [];
    newEquation[fromSide].terms = newEquation[fromSide].terms.filter(item => {
      if (isTerm(item) && termIds.includes(item.id)) {
        termsToMove.push(item);
        return false; // Remove from source
      }
      return true; // Keep in source
    });
    
    // Add to target side with opposite sign
    const movedTerms = termsToMove.map(term => ({
      ...term,
      coefficient: -term.coefficient,
      isSelected: false
    }));
    
    newEquation[toSide].terms.push(...movedTerms);
    
    return newEquation;
  }

  private static cloneEquation(equation: Equation): Equation {
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

  static getOperationDescription(operation: Operation): string {
    const symbol = {
      add: '+',
      subtract: '-',
      multiply: '×',
      divide: '÷'
    }[operation.type];

    return `${symbol} ${operation.value} ${operation.side === 'both' ? 'both sides' : operation.side + ' side'}`;
  }
}