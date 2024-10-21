module.exports = {
  validateRoll
};

async function validateRoll(
    rolledNumbers,
    sessionRollNumber,
    firstRoll,
    currentRollNumber
  ) {
    if (firstRoll) {
      sessionRollNumber = rolledNumbers;
      switch (rolledNumbers) {
        case 2:
          console.log('you lose on first try with 1 and 1');
          return 'you lose on first try with 1 and 1 try again';
        case 3:
          console.log('you lose on first try with 2 and 1');
          return 'you lose on first try with 2 and 1 try again';
        case 11:
          console.log('you win on first try with 11');
          return 'you win on first try with 11';
        case 7:
          console.log('you win on first try with 7');
          return 'you win on first try with 7';
        default:
          return 'Roll ' + rolledNumbers + ' to win';
      }
    } else {
      if (sessionRollNumber === currentRollNumber) {

        return (
          'you win on first try with match ' +
          rolledNumbers +
          ' and ' +
          currentRollNumber
        )
      } else if (currentRollNumber === 7) {
        return 'You lose by rolling 7';
      } else {
        return 'You rolled ' + rolledNumbers;
      }
    }
  }

