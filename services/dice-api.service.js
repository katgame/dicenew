process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fetch = require('node-fetch');
const crypto = require('crypto');
var apiUrl = 'https://www.bhakisystem.co.za:448/api/';

const ENCRYPTION_KEY = 'abcdefghijklmnopqrstuvwx'; // 24 chars
const IV_LENGTH = 16; // Initialization vector length

module.exports = {
    getAll,
    getById,
    updateGameStats,
    leaveGame,
    updateGameStatsToGamePlay,
    creditFunds,
    updateRoundAccount

};

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-192-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

async function updateGameStatsToGamePlay(gameID) {
  url = apiUrl + 'Authentication/update-game-stats-to-play?gameId=' + gameID;
  fetch(url, {
    method: 'POST', // Specify the HTTP method
    headers: {
      'Content-Type': 'application/json', // Set the content type
    },
   // body: JSON.stringify(data), // Convert the data to JSON string
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON response
    })
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function updateGameStats(data) {
  url = apiUrl + 'Authentication/update-game-stats';
  fetch(url, {
    method: 'POST', // Specify the HTTP method
    headers: {
      'Content-Type': 'application/json', // Set the content type
    },
    body: JSON.stringify(data), // Convert the data to JSON string
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON response
    })
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function creditFunds(data) {
  const payload = { sensitiveData: data };
  const encryptedPayload = encrypt(JSON.stringify(payload));

  url = apiUrl + 'Account/credit-funds';
  fetch(url, {
    method: 'POST', // Specify the HTTP method
    headers: {
      'Content-Type': 'application/json', // Set the content type
    },
    body: JSON.stringify({ encryptedData: encryptedPayload }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON response
    })
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function updateRoundAccount(data) {
  const payload = { sensitiveData: data, transactionTime :  new Date().toLocaleString()};
  const encryptedPayload = encrypt(JSON.stringify(payload));

  url = apiUrl + 'Account/update-account';
  fetch(url, {
    method: 'POST', // Specify the HTTP method
    headers: {
      'Content-Type': 'application/json', // Set the content type
    },
    body: JSON.stringify({ encryptedData: encryptedPayload }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON response
    })
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


async function getAll() {
  url = apiUrl + 'Authentication/all-user';
  fetch(url, {
    method: 'GET', // Specify the HTTP method
    headers: {
      'Content-Type': 'application/json', // Set the content type
    }
   // body: JSON.stringify(data), // Convert the data to JSON string
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON response
    })
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function getById(id) {
  url = apiUrl + 'Authentication/get-user?userId=' + id;
  fetch(url, {
    method: 'GET', // Specify the HTTP method
    headers: {
      'Content-Type': 'application/json', // Set the content type
    }
   // body: JSON.stringify(data), // Convert the data to JSON string
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON response
    })
    .then(result => {
      console.log('Success:', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function findAndGetGame(gameID) {
    for (var i = 0; i < oModel.games.length; i++) {
      if (oModel.games[i].id == gameID) {
        return oModel.games[i].instance
      }
    }
    return null
  }

// async function updateGameStats(obj) {
//     let user = await User.findById(obj._id);
//     user.gameId = obj.gameId;
//     user.gameState = obj.gameState;
//     user.userUniqueId = obj.userUniqueId;
//     await user.save();
// }

async function leaveGame(userId) {
    var oGame = findAndGetGame(user.gameId);
    oGame.removePlayer(user.userUniqueId);

    url = apiUrl + 'Authentication/leave-game?userId=' + userId;
    fetch(url, {
      method: 'POST', // Specify the HTTP method
      headers: {
        'Content-Type': 'application/json', // Set the content type
      },
     // body: JSON.stringify(data), // Convert the data to JSON string
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
      })
      .then(result => {
        console.log('Success:', result);
      })
      .catch(error => {
        console.error('Error:', error);
      });



}

// async function gameComplete(gameId) {
//     console.log("gameComplete service called")
//     let users = await User.find({gameId:gameId});
//     for(let i=0;i<users.length;i++){
//         users[i].gameId = undefined;
//         users[i].gameState = undefined;
//         users[i].userUniqueId = undefined;
//         await users[i].save();
//     }
// }

// async function updateGameStatsToGamePlay(gameId) {
//     let users = await User.find({gameId:gameId});
//     for(let i=0;i<users.length;i++){
//         users[i].gameState = "gamePlay";
//         await users[i].save();
//     }
// }

// async function register(userParam) {
//     console.log(userParam)
    
//     // validate
//     if (await User.findOne({ userName: userParam.userName })) {
//         throw 'Username "' + userParam.userName + '" is already taken';
//     }

//     const user = new User(userParam);

//     // save user
//     await user.save();
// }
