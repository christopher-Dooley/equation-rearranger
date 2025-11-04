import React, { useState } from 'react';
import type { Operation } from '../types/equation';

interface OperationInputProps {
  onApplyOperation: (operation: Operation) => void;
}

const OperationInput: React.FC<OperationInputProps> = ({ onApplyOperation }) => {
  const [operationType, setOperationType] = useState<'add' | 'subtract' | 'multiply' | 'divide'>('add');
  const [operationValue, setOperationValue] = useState('');
  const [operationSide, setOperationSide] = useState<'both' | 'left' | 'right'>('both');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operationValue.trim()) {
      alert('Please enter a value for the operation');
      return;
    }

    const operation: Operation = {
      type: operationType,
      value: operationValue.trim(),
      side: operationSide,
      description: `${operationType} ${operationValue} ${operationSide === 'both' ? 'both sides' : operationSide + ' side'}`
    };

    onApplyOperation(operation);
    setOperationValue('');
  };

  const getOperationSymbol = (type: string): string => {
    switch (type) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return '+';
    }
  };

  return (
    <div className="operation-input">
      <h3>Apply Operation</h3>
      <form onSubmit={handleSubmit} className="operation-form">
        <div className="operation-row">
          <select 
            value={operationType}
            onChange={(e) => setOperationType(e.target.value as typeof operationType)}
            className="operation-select"
          >
            <option value="add">Add (+)</option>
            <option value="subtract">Subtract (-)</option>
            <option value="multiply">Multiply (×)</option>
            <option value="divide">Divide (÷)</option>
          </select>
          
          <input
            type="text"
            value={operationValue}
            onChange={(e) => setOperationValue(e.target.value)}
            placeholder="e.g., 5, x, 2y"
            className="operation-value"
          />
          
          <select
            value={operationSide}
            onChange={(e) => setOperationSide(e.target.value as typeof operationSide)}
            className="operation-side"
          >
            <option value="both">Both Sides</option>
            <option value="left">Left Side</option>
            <option value="right">Right Side</option>
          </select>
          
          <button type="submit" className="apply-button">
            Apply {getOperationSymbol(operationType)}
          </button>
        </div>
        
        <div className="operation-examples">
          <small>
            Examples: "5" (constant), "x" (variable), "2y" (coefficient + variable)
          </small>
        </div>
      </form>
    </div>
  );
};

export default OperationInput;