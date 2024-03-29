document.addEventListener('DOMContentLoaded', function() {
    const operationDisplay = document.getElementById('operation');
    const resultDisplay = document.getElementById('result');
    let currentOperation = '';
    let currentCalculation = { operands: [], operator: '' };
    let awaitingNextOperand = false;
  
    function updateDisplay() {
      operationDisplay.textContent = currentOperation;
    }
  
    function resetCalculator() {
      currentOperation = '';
      currentCalculation = { operands: [], operator: '' };
      updateDisplay();
      resultDisplay.textContent = '';
    }
  
    function inputDigit(digit) {
      if (awaitingNextOperand) {
        currentOperation = digit;
        awaitingNextOperand = false;
      } else {
        currentOperation += digit;
      }
      updateDisplay();
    }
  
    function inputOperator(operator) {
      const currentValue = parseFloat(currentOperation);
      if (currentCalculation.operands.length === 1 && currentCalculation.operator) {
        currentCalculation.operands.push(currentValue);
        performCalculation();
      } else {
        currentCalculation.operands.push(currentValue);
      }
      currentCalculation.operator = operator;
      awaitingNextOperand = true;
    }
  
    function performCalculation() {
      if (currentCalculation.operands.length === 2) {
        fetch('/api/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operands: currentCalculation.operands,
            operator: currentCalculation.operator
          })
        })
        .then(response => response.json())
        .then(data => {
          fetch(`/api/result/${data.calc_id}`)
            .then(response => response.json())
            .then(data => {
              resultDisplay.textContent = data.result;
              currentOperation = data.result; // Update current operation with result
              currentCalculation = { operands: [], operator: '' }; // Reset calculation
            })
            .catch(error => {
              resultDisplay.textContent = 'Error retrieving result';
              console.error('Error:', error);
            });
        })
        .catch(error => {
          resultDisplay.textContent = 'Error calculating';
          console.error('Error:', error);
        });
      }
    }
  
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', function(event) {
        const { target } = event;
        if (target.classList.contains('operator')) {
          inputOperator(target.dataset.operation);
        } else if (target.id === 'reset') {
          resetCalculator();
        } else if (target.id === 'equals') {
          if (currentCalculation.operands.length === 1) {
            inputOperator(currentCalculation.operator);
          }
          if (currentOperation !== '' && currentCalculation.operands.length === 1) {
            currentCalculation.operands.push(parseFloat(currentOperation));
            performCalculation();
          }
        } else {
          inputDigit(target.textContent.trim());
        }
      });
    });
  
  });
  