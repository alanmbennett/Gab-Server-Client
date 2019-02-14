/* Author: Alan Bennett
 * Date: 2/14/2019
 * Project 1: GAB Chat Client
*/

/* Imports\Dependencies */

const WebSocket = require('ws');
const blessed = require('blessed');
const moment = require('moment');
const fs = require('fs');
const styling = require('./styling.json');
const Poll = require('./poll.js');

/* Global variables */
let username;
let defaultPath = `ws://localhost:4930`;
let actualPath = defaultPath; 
let lastMessage;
let myPoll = null;
let reprintPollRegex = /\\reprintPoll/;

/* UI ELEMENTS - START */
/** LOGIN SCREEN - START **/

// Screen objects
let mainScreen = blessed.screen({
    smartCSR: true
});

// User login screen
let usernameForm = blessed.form(
{
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%', 
    content: 'Input a username and connection: ',
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff',
        }
    }
});

// Username field label
let usernameText = blessed.Text(
{
    parent: usernameForm,
    top: '15%',
    left: 0,
    content: 'Username'   
});

// Connection field label
let connectionText = blessed.Text({
    parent: usernameForm,
    top: '35%',
    left: 0,
    content: 'Connection'
});

// Login error message text
let errText = blessed.Text({
    parent: usernameForm,
    hidden: true,
    top: '75%',
    left: 0,
    content: 'Error: Username must be alphanumeric ranging from 3 to 10 characters. ',
    style: {
        fg: 'red',
    }
});

// Username field
let usernameField = blessed.textbox(
{
    parent: usernameForm, 
    top: '10%',
    left: '20%',
    width: '60%',
    height: '15%', 
    border: {
        type: 'line'
    },
    inputOnFocus: true,
    keys: true,
    mouse: true,
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff'
        }
    }
});

// Connection path field
let pathField = blessed.textbox(
{
    parent: usernameForm, 
    top: '30%',
    left: '25%',
    width: '60%',
    height: '15%', 
    border: {
        type: 'line'
    },
    inputOnFocus: true,
    keys: true,
    mouse: true,
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff'
        }
    }
});

// Connect button
let submitButton = blessed.button({
    parent: usernameForm,
    top: '50%',
    left: '40%',
    width: '30%',
    height: '15%',
    border: {
        type: 'line'
    },
    content: 'Connect',
    align: 'center',
    mouse: true,
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#ffffff',
        },
        hover: {
            bg: 'red'
        },
        focus: {
            bg: 'red'
        }
    }
});

// Cancel button
let cancelButton = blessed.button({
    parent: usernameForm,
    top: '50%',
    left: 0,
    width: '30%',
    height: '15%',
    border: {
        type: 'line'
    },
    content: 'Cancel',
    align: 'center',
    mouse: true,
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#ffffff',
        },
        hover: {
            bg: 'red'
        },
        focus: {
            bg: 'red'
        }
    }
});

/** LOGIN SCREEN - END **/
/** CHAT SCREEN - START **/

// Box for chat history
let chatbox = blessed.box(
{
  top: 'left',
  width: '70%',
  height: '90%',
  alwaysScroll:true,
  scrollable: true,
  label: 'Chatroom',
  mouse: true,
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    border: {
      fg: '#ffffff'
    },
    scrollbar: {
        bg: 'green'
    }
  }
});

// Box for user information
let userBox = blessed.box (
{
    top: 'right',
    right: 0,
    label: 'User Info',
    width: '30%',
    height: '15%',
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        border: {
        fg: '#ffffff'
        }
  }
});

// Box for list of users in chatroom
let userListBox = blessed.box (
{
    top: '15%',
    right: 0,
    width: '30%',
    height: '40%',
    scrollable: true, 
    label: 'Other Users in the Chat',
    border: {
        type: 'line'
    },
   style: {
    fg: 'white',
    border: {
      fg: '#ffffff'
    }
  }
});

// Helpful guide for chat client commands
let commandBox = blessed.box (
{
    top: '54%',
    right: 0,
    width: '30%',
    height: '35%',
    scrollable: true, 
    label:'Commands',
    content: ' Whisper/DM: \\w USERNAME MESSAGE \n Check username: \\whoami \n Add style: \\addStyle REGEX STYLE \n Delete style: \\rmStyle REGEX\n Make a poll: \\mkPoll QUESTION\n Add Answer to Poll: \\add2Poll ANSWER\n Open poll: \\openPoll\n Close poll: \\closePoll',
    border: {
        type: 'line'
    },
   style: {
    fg: 'white',
    border: {
      fg: '#ffffff'
    }
  }
});

// Error message upon termination 
let terminatedMessage = blessed.message (
{
    top: 'center',
    left: 'center',
    width: '50%',
    height: '50%', 
    border: {
        type: 'line'
    },
    keys: true,
    mouse: true,
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff'
        }
    }
});

// Field for inputting chatroom messages
let msgInputBox = blessed.textbox(
{
    bottom: 0,
    width: '60%',
    height: '10%', 
    border: {
        type: 'line'
    },
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: {
        fg: 'white',
        border: {
            fg: '#ffffff'
        }
    }
});

// Send message button
let enterButton = blessed.button(
{
    bottom: 0,
    left: '60%',
    width: '10%',
    height: '10%',
    border: {
        type: 'line'
    },
    content: 'Send',
    align: 'center',
    mouse: true,
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#ffffff',
        },
        hover: {
            bg: 'red'
        }
    }
});

// Logout/exit button
let logoutButton = blessed.button(
{
    bottom: 0,
    right: 0,
    content: 'Logout',  
    width: '20%',
    height: '10%',
    border: {
        type: 'line'
    },
    align: 'center',
    mouse: true,
    style: {
        fg: 'white',
        bg: 'green',
        border: {
            fg: '#ffffff',
        },
        hover: {
            bg: 'red'
        }
    }
});

/** CHAT SCREEN - END **/
/* UI ELEMENTS - END */

/* Main app's functions */

// Make a message JSON
function createMsg(kindStr, dataStr, toStr = 'all')
{
    let obj = 
    {
        from: username,
        to: toStr,
        kind: kindStr,
        data: dataStr  
    };
    
    return obj;
}

// Print message to chatroom history
function printMsg(jsonMsg)
{
    let styledData = applyStyles(jsonMsg.data); // apply any existing styles to message
    
    if(jsonMsg.kind === 'direct') // message is whisper/DM
    {    
        chatbox.pushLine(`{green-fg}[${moment().format('h:mm a')}] [DM from ${jsonMsg.from} to ${jsonMsg.to}]: ${styledData} {/green-fg}`);
    }
    else if(jsonMsg.kind === 'error') // message is error message
    {
        chatbox.pushLine(`{red-fg}SERVER ERROR: ${jsonMsg.data}{/red-fg}`);         
    }
    else if(jsonMsg.from === 'GABServer' || jsonMsg.kind === 'server') // message is from the server 
    {
        chatbox.pushLine(`{yellow-fg}SERVER MSG: ${jsonMsg.data}{/yellow-fg}`);
    }
    else // Otherwise, just print out as a normal message
    {
        chatbox.pushLine(`[${moment().format('h:mm a')}] ${jsonMsg.from}: ${styledData} `);
    }
    
    chatbox.setScrollPerc(100); //Scroll to bottom of history
    mainScreen.render(); // Rerender screen
}

// Apply any existing styles to string given
function applyStyles(str)
{ 
    styling.styles.forEach((elem) => {
        let allMatches = str.match(elem.expression);
        if(allMatches !== null)
        {
            switch(elem.style)
            {
                case 'bold': 
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{bold}${match}{/bold}`);
                    });
                    break;
                case 'underline':
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{underline}${match}{/underline}`);
                    });
                    break;
                case 'italic':
                case 'italics':
                    break;
                case 'blink':
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{blink}${match}{/blink}`);
                    });
                    break;
                case 'inverse':
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{inverse}${match}{/inverse}`);
                    });
                    break;
                default: // assumes it is a color
                    allMatches.forEach((match) => {
                        str = str.replace(new RegExp(match,'g'), `{${elem.style}-fg}${match}{/}`);
                    });
            }  
        }
    });
    
    return str;
}

// Send a message to the server or to the client
function sendMsg(conn, msg)
{
    /* Regex */
    let whisperRegex = /\\w ([a-zA-Z0-9]{0,10}) .+/;
    let userlistRegex = /\\userlist/;
    let whoamiRegex = /\\whoami/;
    let addStyleRegex = /\\addStyle (.+) (.+)/;
    let deleteStyleRegex = /\\rmStyle (.+)/;
    let makePollRegex = /\\mkPoll (.+)/;
    let add2PollRegex = /\\add2Poll (.+)/;
    let openPollRegex = /\\openPoll/;
    let closePollRegex = /\\closePoll/;
    
    if(msg && msg.length !== 0) // as long as message is not null and not an empty string
    {
        if(whisperRegex.test(msg)) // outgoing message is whisper
        {
            let data = msg.replace(/(\\w [a-zA-Z0-9]{0,10}) /, '');
            let to = msg.split(/\\w ([a-zA-Z0-9]{0,10}) .+/);
            
            conn.send(JSON.stringify(createMsg('direct', data, to[1])));
            printMsg(createMsg('direct', data, to[1]));
        }
        else if(userlistRegex.test(msg)) // outgoing message is userlist request
        {
             conn.send(JSON.stringify(createMsg('userlist', '', '')));
             printMsg(createMsg('chat', msg));
        }
        else if(whoamiRegex.test(msg)) // outgoing message is whoami request
        {
             conn.send(JSON.stringify(createMsg('whoami', '', '')));
             printMsg(createMsg('chat', msg));
        }
        else if(addStyleRegex.test(msg.trim())) // message is a stylization command
        {
            let styleArr = msg.trim().split(addStyleRegex);
            if(styleArr[2] !== 'italic' && styleArr[2] !== 'italics') 
            {
                let found = -1;
                
                /* See if style already exists */
                for(let i = 0; i < styling.styles.length; i++)
                {
                    if(styling.styles[i].expression === styleArr[1])
                    {
                        found = i;
                    }     
                }
            
                /* If not found, save the new style*/
                if(found === -1)
                {
                    styling.styles.push({"expression": styleArr[1], "style": styleArr[2]});
                    saveStyles();
                    printMsg(createMsg('server', 'Style successfully saved'));
                }
                /* If found, overwrite the style */
                else 
                {
                    styling.styles[found] = {"expression": styleArr[1], "style": styleArr[2]};
                    saveStyles();
                    printMsg(createMsg('server', 'Existing style successfully overwritten'));
                }
            }
            /* Style is italics, client does not support italics due to Blessedjs limitations */
            else
            {
                printMsg(createMsg('error', 'No support for italics on this client.'));
            }
        }
        else if(deleteStyleRegex.test(msg)) // message wants to delete a style
        {
            let styleArr = msg.split(deleteStyleRegex);
            let found = -1;
            
            /* Search for style to delete */
            for(let i = 0; i < styling.styles.length; i++)
            {
                if(styling.styles[i].expression === styleArr[1])
                {
                    found = i;
                }     
            } 
            
            if(found !== -1) // if style is found
            {
                styling.styles.splice(found, 1);
                saveStyles();
                printMsg(createMsg('server', 'Style successfully deleted'));
            }
        }
        else if(makePollRegex.test(msg)) // create a poll
        {
            let arr = msg.split(makePollRegex);
            
            myPoll = new Poll(arr[1]);
            
            printMsg(createMsg('server', 'New poll started! Now add some answers and open it to the chatroom.'));
        }
        else if(add2PollRegex.test(msg)) // add answer to poll
        {
            if(myPoll === null)
            {
                printMsg(createMsg('server', `Adding to poll failed! You haven't created a poll yet!! Create one with \\mkPoll QUESTION`));
            }
            else if(!myPoll.getOpen)
            {
                let arr = msg.split(add2PollRegex);
            
                myPoll.addAnswer(arr[1]);
            
                printMsg(createMsg('server', `Answer added to poll "${myPoll.getQuestion}"`));
            }
            else
            {
                printMsg(createMsg('server', `Your poll is open for voting, you cannot add any more answers to it. Please close it first with \\closePoll`)); 
            }
        }
        else if(openPollRegex.test(msg)) // open poll to the chatroom and send poll string to server
        {
            if(myPoll === null)
            {
                printMsg(createMsg('server', `Opening poll failed! You haven't created a poll yet!! Create one with \\mkPoll QUESTION`));
            }
            else if(myPoll.enoughAnswers())
            {
                let instr = `To vote on it, type \\pollAns# (where # is the number of your answer) in the chat or whisper it to ${username}.\n`;
                myPoll.setOpen(true);
                conn.send(JSON.stringify(createMsg('chat', `[AUTOMATED MSG] ${username} has created a poll!:\n\n${myPoll.toString()}\n${instr}\n`)));
            } 
            else 
            {
                printMsg(createMsg('server', `Opening poll failed! You need at least 2 answers to open your poll to the public. Add some with \\add2Poll ANSWER`));
            }
        }
        else if(closePollRegex.test(msg)) // close poll to chatroom and send results to it
        {
            if(myPoll === null)
            {
                printMsg(createMsg('server', `Closing poll failed! You haven't created a poll yet!! Create one with \\mkPoll QUESTION`));
            }
            else if(myPoll.getOpen)
            {
                myPoll.setOpen(false);
                conn.send(JSON.stringify(createMsg('chat', `[AUTOMATED MSG] ${username} has closed their poll!\n\n${myPoll.results()}`)));
            } 
            else
            {
                printMsg(createMsg('server', `Your poll "${myPoll.getQuestion}" is already closed.`));
            }
        }
        else // Else, send as normal chat message
        {
            conn.send(JSON.stringify(createMsg('chat', msg)));
        }
    }
}

function addUsers(obj) // Add users to userlist box
{
    let users = obj.data.split(',');
    userListBox.setContent(''); 
    users.forEach((elem) => {
        if(elem !== username)
            userListBox.pushLine(elem);
    });
    mainScreen.render();
}

function makeConnection() // Connect to server and listen for events
{
    const connection = new WebSocket(`${actualPath}/?username=${username}`);
    let sysUserlistCall = false;
    userBox.setContent(`Logged in as ${username} `);
    let errorMsg;
    let errEvent = false;
    
    /* Add chatroom elements to screen */
    mainScreen.append(chatbox);
    mainScreen.append(msgInputBox);
    mainScreen.append(enterButton);
    mainScreen.append(userBox);
    mainScreen.append(userListBox);
    mainScreen.append(commandBox);
    mainScreen.append(logoutButton);
    mainScreen.title = `Chatroom connection: ${actualPath}`;
    mainScreen.render();
    
    /* Listeners */
    connection.onclose = () => 
    {
        if(lastMessage !== undefined && lastMessage.kind === 'error' && !errEvent)
            errorMsg = `${lastMessage.data}\n\n\nClick anywhere or press any key to end program.`;
        else if(!errEvent)
            errorMsg = `Server has terminated connection for unspecified reason.\n\n\nClick anywhere or press any key to end program.`;
        enterButton.hide();
        msgInputBox.hide();
        mainScreen.append(terminatedMessage);
        
        terminatedMessage.error(errorMsg, 0, restart);
    };
    
    connection.onerror = () =>
    {
        errEvent = true;
        errorMsg = 'Invalid connection.\n\n\nClick anywhere or press any key to end program.';
    }
    
    connection.onopen = () =>
    {    
        msgInputBox.focus();
        
        enterButton.on('press', function() {
           let input = msgInputBox.getValue();
           msgInputBox.clearValue();
           sendMsg(connection, input);
        });
        
        msgInputBox.key(['enter'], function(ch, key)  {
            let input = msgInputBox.getValue();
            msgInputBox.clearValue();
            sendMsg(connection, input);
            msgInputBox.focus();
        });   
    } 
    
    connection.onmessage = msg => 
    { 
        let serverJSON = JSON.parse(msg.data);
        lastMessage = serverJSON;
        let pollAnsRegex = /^\\pollAns([0-9]+)$/;
        
        switch(serverJSON.kind)
        {
            case 'userlist':
                addUsers(serverJSON);
                sysUserlistCall = false; 
                break;
            case 'connection':
                printMsg(serverJSON);
                sysUserlistCall = true;
                connection.send(JSON.stringify(createMsg('userlist', "", "")));
                break;
            default:
                if(pollAnsRegex.test(serverJSON.data) && serverJSON.from != username)
                {
                    if(myPoll === null)
                    {   
                    }
                    else if(!myPoll.getOpen)
                    {
                        connection.send(JSON.stringify(createMsg('direct', '[AUTOMATED MSG] Poll is not open for voting at this time.', serverJSON.from))); 
                    }
                    else if(myPoll.alreadyVoted(serverJSON.from))
                    {
                         connection.send(JSON.stringify(createMsg('direct', '[AUTOMATED MSG] You have already voted in this poll.', serverJSON.from)));   
                    }
                    else
                    {
                        let ans = serverJSON.data.split(pollAnsRegex);
                        if(myPoll.validAnswer(parseInt(ans[1])))
                        {
                           myPoll.addVote(parseInt(ans[1]), serverJSON.from);
                           connection.send(JSON.stringify(createMsg('direct', `[AUTOMATED MSG] Thanks for your answer, ${serverJSON.from}! The results of the poll will be made public once ${username} closes it so stay tuned.`, serverJSON.from))); 
                           printMsg(serverJSON);
                        }
                        else
                        {
                            connection.send(JSON.stringify(createMsg('direct', `[AUTOMATED MSG] Error: Invalid answer.`, serverJSON.from))); 
                        }   
                    }
                }
                else 
                {
                    printMsg(serverJSON);
                }
        }
    };
    
}

function saveStyles()
{
    try
    {
        fs.writeFileSync('./styling.json', JSON.stringify(styling));
    }
    catch(err)
    {
        printMsg(createMsg('error', err.message))
    }
}

function endApp()
{
    return process.exit(0);
}

function getUsername (callback)
{
    usernameRegex = /^[A-Za-z0-9]{3,10}$/;
    mainScreen.append(usernameForm);
    pathField.setValue(defaultPath);
    usernameField.clearValue();
    mainScreen.title = 'Chatroom client login';
    mainScreen.render();
    
    usernameField.focus();
    
    usernameField.on('press', function(ch, key) { // mouse press on username field
        usernameField.focus();
    });
    
    usernameField.on('keypress', function(ch, key) // evaluate username as user types
    {   
        if(usernameRegex.test(usernameField.getValue()))
        {
            errText.hide();
            usernameField.style.bg = '';
        }
        else
        {
            errText.show();
            usernameField.style.bg = 'red';
        }
        
    });
    
    usernameField.key(['enter'], function(ch, key)  { // enter key press on username field
            pathField.focus();
    }); 
    
    pathField.on('press', function(ch, key) { // mouse press on connection path field
            pathField.focus();
    });
    
    pathField.key(['enter'], function(ch, key)  { // enter key press on connection path field
            submitButton.focus();
    }); 
    
    cancelButton.on('press', function() { // mouse press on cancel button
            endApp();
    });
    
    submitButton.on('press', function() { // mouse press on submit button
        
        if(usernameRegex.test(usernameField.getValue()))
        {
            errText.hide();
            usernameField.style.bg = '';
            username = usernameField.getValue();
            actualPath = pathField.getValue();
        
            mainScreen.remove(usernameForm);
            

            callback();
        }
        else
        {
            errText.show();
            usernameField.style.bg = 'red';
        }
    });
    
}

// Quit on Escape, q, or Control-C.
mainScreen.key(['escape', 'q', 'C-c'], function(ch, key) 
{
    endApp();
});

logoutButton.on('press', function() {
    endApp();
});


// start program
getUsername(makeConnection);

