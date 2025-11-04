import React from 'react';
import type { EquationHistoryStep } from '../types/equation';

const getEducationalExplanation = (step: EquationHistoryStep): string => {
  if (step.operation) {
    const { type, value, side } = step.operation;
    
    switch (type) {
      case 'add':
        return `Added ${value} to ${side === 'both' ? 'both sides' : `the ${side} side`} to maintain balance`;
      case 'subtract':
        return `Subtracted ${value} from ${side === 'both' ? 'both sides' : `the ${side} side`} to isolate terms`;
      case 'multiply':
        return `Multiplied ${side === 'both' ? 'both sides' : `the ${side} side`} by ${value} to scale the equation`;
      case 'divide':
        return `Divided ${side === 'both' ? 'both sides' : `the ${side} side`} by ${value} to simplify coefficients`;
      default:
        return step.description;
    }
  } else if (step.description.includes('Moved')) {
    return `Moved terms to the other side to group similar terms together`;
  } else if (step.description.includes('Initial')) {
    return `Starting equation - the goal is to isolate the variable on one side`;
  }
  
  return step.description;
};

interface HistoryPanelProps {
  history: EquationHistoryStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  currentStepIndex,
  onStepClick
}) => {
  if (history.length === 0) {
    return (
      <div className="history-panel">
        <h3>Operation History</h3>
        <div className="empty-history">
          No operations yet. Start by entering an equation and applying operations.
        </div>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <h3>Operation History</h3>
      <div className="history-steps">
        {history.map((step, index) => {
          const explanation = getEducationalExplanation(step);
          return (
            <div
              key={index}
              className={`history-step ${index === currentStepIndex ? 'current' : ''} ${
                index < currentStepIndex ? 'past' : 'future'
              }`}
              onClick={() => onStepClick(index)}
            >
              <div className="step-number">Step {index + 1}</div>
              <div className="step-description">
                {step.operation ? (
                  <span className="operation">
                    {step.operation.type === 'add' && '+'}
                    {step.operation.type === 'subtract' && '-'}
                    {step.operation.type === 'multiply' && '×'}
                    {step.operation.type === 'divide' && '÷'}
                    {' '}{step.operation.value} {step.operation.side === 'both' ? 'both sides' : step.operation.side + ' side'}
                  </span>
                ) : (
                  <span className="initial">Initial equation</span>
                )}
              </div>
              <div className="educational-explanation">
                {explanation}
              </div>
              <div className="step-equation">
                {step.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryPanel;