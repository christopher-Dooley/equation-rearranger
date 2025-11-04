import React from 'react';
import type { Term, VisualSettings } from '../types/equation';

interface TermComponentProps {
  term: Term;
  visualSettings: VisualSettings;
  onSelect: (termId: string, isMultiSelect: boolean) => void;
  isDragging: boolean;
}

const TermComponent: React.FC<TermComponentProps> = ({
  term,
  visualSettings,
  onSelect,
  isDragging
}) => {
  const getTermColor = (variable: string | null): string => {
    if (variable === null) return '#6B7280'; // Gray for constants
    
    if (visualSettings.colors[variable]) {
      return visualSettings.colors[variable];
    }
    
    // Generate a consistent color based on the variable name
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];
    const index = variable.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleClick = (e: React.MouseEvent) => {
    onSelect(term.id, e.shiftKey);
  };

  const renderSingleView = () => {
    const color = getTermColor(term.variable);
    const isNegative = term.coefficient < 0;
    const absCoefficient = Math.abs(term.coefficient);
    
    let displayText = '';
    if (term.isConstant) {
      displayText = term.coefficient.toString();
    } else {
      if (absCoefficient === 1) {
        displayText = term.variable || '';
      } else {
        displayText = `${absCoefficient}${term.variable}`;
      }
    }

    return (
      <div
        className={`term-box ${term.isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          borderColor: color,
          backgroundColor: term.isSelected ? `${color}20` : 'white'
        }}
        onClick={handleClick}
      >
        {isNegative && <span className="negative-sign">-</span>}
        <span className="term-content">{displayText}</span>
      </div>
    );
  };

  const renderCloudView = () => {
    const color = getTermColor(term.variable);
    const isNegative = term.coefficient < 0;
    const absCoefficient = Math.abs(term.coefficient);
    
    const items = [];
    for (let i = 0; i < absCoefficient; i++) {
      items.push(
        <div
          key={i}
          className="cloud-item"
          style={{
            borderColor: color,
            backgroundColor: term.isSelected ? `${color}20` : 'white'
          }}
        >
          {term.variable || '1'}
        </div>
      );
    }

    return (
      <div
        className={`term-cloud ${term.isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        onClick={handleClick}
      >
        {isNegative && <span className="negative-sign">-</span>}
        <div className="cloud-container">
          {items}
        </div>
      </div>
    );
  };

  return visualSettings.viewMode === 'single' ? renderSingleView() : renderCloudView();
};

export default TermComponent;