const express = require('express');
const app = express();

// Stream Chat server SDK
const StreamChat = require('stream-chat').StreamChat;
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile('/index.html');
});

app.listen(8800, () => {
  console.log('Example app listening on port 8800!');
});

const serverClient = new StreamChat('t59sh7ygbtxb', 'narnbvke6dwufrk8a2putxhzudv9fjcxns9tse9p6pf6vqpkcctnbnmmm3kq27wp');

app.get('/token', (req, res) => {
  const { username } = req.query;
  if (username) {
    const token = serverClient.createToken(username);
    res.status(200).json({ token, status: 'sucess' });
  } else {
    res.status(401).json({ message: 'invalid request', status: 'error' });
  }
});

app.post('/updateUser', async (req, res) => {
    const { userID } = req.body

    if (userID) {
        const updateResponse = await serverClient.updateUsers([{ 
            id: userID, 
            role: 'admin'
         }]);
    
        res.status(200).json({ user: updateResponse, status: "sucess" })
    } else {
        res.status(401).json({ message: "invalid request", status: "error" })
    }
});